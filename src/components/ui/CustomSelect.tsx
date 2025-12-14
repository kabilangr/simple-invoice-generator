import React from 'react';
import Select, { Props as SelectProps, StylesConfig } from 'react-select';
import { useTheme } from 'next-themes';

interface Option {
  label: string;
  value: string;
}

const CustomSelect: React.FC<SelectProps<Option>> = (props) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const customStyles: StylesConfig<Option> = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: 'var(--background)',
      borderColor: state.isFocused ? 'var(--ring)' : 'var(--input)',
      color: 'var(--foreground)',
      boxShadow: state.isFocused ? '0 0 0 2px var(--background), 0 0 0 4px var(--ring)' : 'none',
      borderRadius: 'var(--radius-md)',
      padding: '2px',
      '&:hover': {
        borderColor: state.isFocused ? 'var(--ring)' : 'var(--input)', // Keep consistent on hover
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'var(--popover)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      zIndex: 50,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? 'var(--primary)'
        : state.isFocused
        ? 'var(--accent)'
        : 'transparent',
      color: state.isSelected
        ? 'var(--primary-foreground)'
        : state.isFocused
        ? 'var(--accent-foreground)'
        : 'var(--popover-foreground)',
      cursor: 'pointer',
      ':active': {
        backgroundColor: 'var(--primary)',
        color: 'var(--primary-foreground)',
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'var(--foreground)',
    }),
    input: (provided) => ({
      ...provided,
      color: 'var(--foreground)',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: 'var(--muted-foreground)',
    }),
    indicatorSeparator: () => ({
        display: 'none',
    }),
    dropdownIndicator: (provided) => ({
        ...provided,
        color: 'var(--muted-foreground)',
        '&:hover': {
            color: 'var(--foreground)',
        },
    }),
  };

  return <Select styles={customStyles} {...props} />;
};

export default CustomSelect;
