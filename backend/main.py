import os
import logging
from databricks import sql
from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

host = os.getenv("DATABRICKS_HOSTNAME")
http_path = os.getenv("DATABRICKS_HTTP_PATH")
access_token = os.getenv("DATABRICKS_ACCESS_TOKEN")

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="Simple FastAPI + React App")

def get_databricks_connection():
    """Create and return a Databricks SQL connection"""
    if not access_token:
        raise ValueError("DATABRICKS_TOKEN environment variable not set")
    
    return sql.connect(
        server_hostname=host,
        http_path=http_path,
        access_token=access_token
    )

@app.get("/api/health")
async def health_check():
    logger.info("Health check at /api/health")
    return {"status": "healthy"}

@app.get("/api/classification")
async def get_classification():
    connection = get_databricks_connection()
    cursor = connection.cursor()
    cursor.execute('SELECT resource_category, resource_type, total_count FROM cq_catalog.cloudquery.cloud_assets_counts')
    result = cursor.fetchall()
    cursor.close()
    connection.close()
    
    data = {}
    for row in result:
        resource_category = row[0]
        resource_type = row[1]
        total_count = row[2]
        
        if resource_category not in data:
            data[resource_category] = {
                "resource_category": resource_category,
                "total_count": 0,
                "types": []
            }
        
        # Add the type to the category
        data[resource_category]["types"].append({
            "resource_type": resource_type,
            "total_count": total_count
        })
        
        data[resource_category]["total_count"] += total_count

    
    return {
        "data": list(data.values()),
        "title": "Resource Classification in Databricks"
    }

@app.get("/api/data")
async def get_data(request: Request):
    connection = get_databricks_connection()
    cursor = connection.cursor()

    filter_param = request.query_params.get("filter", "")
    sorting_param = request.query_params.get("sorting", "")
    page = int(request.query_params.get("page", 0))
    page_size = int(request.query_params.get("pageSize", 25))
    offset = page * page_size
    
    def compose_where_clause(filter_array):
        if not filter_array:
            return ""
        
        conditions = []
        for filter_item in filter_array:
            field = filter_item.get("field", "")
            operator = filter_item.get("operator", "")
            value = filter_item.get("value", "")
            
            if not field or not operator or value == "":
                continue
                
            # Handle different operators
            if operator == "equals":
                conditions.append(f"`{field}` = '{value}'")
            elif operator == "doesNotEqual":
                conditions.append(f"`{field}` != '{value}'")
            elif operator == "contains":
                conditions.append(f"`{field}` LIKE '%{value}%'")
            # Add more operators as needed
        
        if conditions:
            return f"WHERE {' AND '.join(conditions)}"
        return ""
    
    def compose_order_by_clause(sort_array):
        if not sort_array:
            return ""
        
        order_clauses = []
        for sort_item in sort_array:
            field = sort_item.get("field", "")
            sort_direction = sort_item.get("sort", "").upper()
            
            if not field or sort_direction not in ["ASC", "DESC"]:
                continue
                
            order_clauses.append(f"`{field}` {sort_direction}")
        
        if order_clauses:
            return f"ORDER BY {', '.join(order_clauses)}"
        return ""
    
    # Parse filter parameter (assuming it's JSON string)
    try:
        import json
        filter_array = json.loads(filter_param) if filter_param else []
        where_clause = compose_where_clause(filter_array)
    except (json.JSONDecodeError, TypeError):
        # Fallback to empty filter if parsing fails
        where_clause = ""
    
    # Parse sort parameter (assuming it's JSON string)
    try:
        import json
        sort_array = json.loads(sorting_param) if sorting_param else []
        order_by_clause = compose_order_by_clause(sort_array)
    except (json.JSONDecodeError, TypeError):
        # Fallback to empty sort if parsing fails
        order_by_clause = ""

    # Get total count first with filter
    count_query = f'SELECT COUNT(*) as total FROM cq_catalog.cloudquery.cloud_assets {where_clause}'
    cursor.execute(count_query)
    total_count = cursor.fetchone()[0]

    # Get paginated data with filter and sorting
    data_query = f'SELECT * FROM cq_catalog.cloudquery.cloud_assets {where_clause} {order_by_clause} LIMIT {page_size} OFFSET {offset}'
    cursor.execute(data_query)
    result = cursor.fetchall()
    
    # Get column names
    columns = [desc[0] for desc in cursor.description]
    
    # Convert to list of dictionaries for JSON serialization
    data = []
    for row in result:
        row_dict = {}
        for i, value in enumerate(row):
            # Convert non-serializable types to strings
            if value is not None:
                try:
                    # Handle different data types more comprehensively
                    if hasattr(value, '__dict__'):
                        row_dict[columns[i]] = str(value)
                    elif isinstance(value, (dict, list, tuple)):
                        row_dict[columns[i]] = str(value)
                    elif isinstance(value, (int, float, str, bool)):
                        row_dict[columns[i]] = value
                    else:
                        # For any other type, convert to string
                        row_dict[columns[i]] = str(value)
                except (TypeError, ValueError, AttributeError):
                    row_dict[columns[i]] = str(value)
            else:
                row_dict[columns[i]] = None
        data.append(row_dict)
    
    cursor.close()
    connection.close()
    
    return {
        "data": data,
        "rowCount": total_count,
        "title": "cloud_assets from Databricks"
    }


# --- Static Files Setup ---
static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")

# --- Catch-all for React Routes ---
@app.get("/{full_path:path}")
async def serve_react(full_path: str):
    index_html = os.path.join(static_dir, "index.html")
    if os.path.exists(index_html):
        logger.info(f"Serving React frontend for path: /{full_path}")
        return FileResponse(index_html)
    logger.error("Frontend not built. index.html missing.")
    raise HTTPException(
        status_code=404,
        detail="Frontend not built. Please run 'npm run build' first."
    )