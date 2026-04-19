import { createContext, useContext } from 'react';
import { ScrollView, TextInput } from 'react-native';

type FormScrollContextValue = {
  scrollToInput: (input: TextInput | null) => void;
};

const FormScrollContext = createContext<FormScrollContextValue>({
  scrollToInput: () => {},
});

export function FormScrollProvider({
  children,
  scrollRef,
  extraOffset = 96,
}: {
  children: React.ReactNode;
  scrollRef: React.RefObject<ScrollView | null>;
  extraOffset?: number;
}) {
  const scrollToInput = (input: TextInput | null) => {
    if (!input || !scrollRef.current) {
      return;
    }

    requestAnimationFrame(() => {
      scrollRef.current?.scrollResponderScrollNativeHandleToKeyboard(input, extraOffset, true);
    });
  };

  return (
    <FormScrollContext.Provider value={{ scrollToInput }}>
      {children}
    </FormScrollContext.Provider>
  );
}

export function useFormScroll() {
  return useContext(FormScrollContext);
}
