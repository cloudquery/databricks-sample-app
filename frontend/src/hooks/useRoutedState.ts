import { useState, useEffect, useCallback } from "react";

interface UseRoutedStateOptions<T> {
  key: string;
  defaultValue: T;
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
}

export const useRoutedState = <T>(
  options: UseRoutedStateOptions<T>
): [T, (value: T) => void] => {
  const {
    key,
    defaultValue,
    serialize = JSON.stringify,
    deserialize = JSON.parse,
  } = options;

  // Initialize state from URL or default
  const getInitialValue = (): T => {
    const urlParams = new URLSearchParams(window.location.search);
    const paramValue = urlParams.get(key);

    if (!paramValue) {
      return defaultValue;
    }

    try {
      const decodedValue = decodeURIComponent(paramValue);
      return deserialize(decodedValue);
    } catch (error) {
      console.warn(`Failed to parse URL parameter "${key}":`, error);
      return defaultValue;
    }
  };

  const [state, setState] = useState<T>(getInitialValue);

  // Update URL with new state value
  const updateURL = useCallback(
    (newValue: T) => {
      const url = new URL(window.location.href);
      const params = url.searchParams;

      try {
        const serializedValue = serialize(newValue);
        const encodedValue = encodeURIComponent(serializedValue);
        params.set(key, encodedValue);
      } catch (error) {
        console.warn(
          `Failed to serialize value for URL parameter "${key}":`,
          error
        );
        params.delete(key);
      }

      window.history.replaceState({}, "", url.toString());
    },
    [key, serialize]
  );

  // Wrapper function that updates both state and URL
  const setValue = useCallback(
    (newValue: T) => {
      setState(newValue);
      updateURL(newValue);
    },
    [updateURL]
  );

  // Listen for browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const newValue = getInitialValue();
      setState(newValue);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return [state, setValue];
};

// Simple convenience hooks
export const useRoutedString = (key: string, defaultValue: string = "") => {
  return useRoutedState({
    key,
    defaultValue,
    serialize: (value) => value,
    deserialize: (value) => value,
  });
};

export const useRoutedNumber = (key: string, defaultValue: number = 0) => {
  return useRoutedState({
    key,
    defaultValue,
    serialize: (value) => value.toString(),
    deserialize: (value) => parseInt(value, 10),
  });
};

export const useRoutedBoolean = (
  key: string,
  defaultValue: boolean = false
) => {
  return useRoutedState({
    key,
    defaultValue,
    serialize: (value) => value.toString(),
    deserialize: (value) => value === "true",
  });
};

export const useRoutedArray = <T>(key: string, defaultValue: T[] = []) => {
  return useRoutedState({
    key,
    defaultValue,
    serialize: JSON.stringify,
    deserialize: JSON.parse,
  });
};

export const useRoutedObject = <T extends Record<string, any>>(
  key: string,
  defaultValue: T
) => {
  return useRoutedState({
    key,
    defaultValue,
    serialize: JSON.stringify,
    deserialize: JSON.parse,
  });
};
