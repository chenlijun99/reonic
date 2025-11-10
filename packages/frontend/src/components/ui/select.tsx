import * as React from 'react';
import {
  Select as AriaSelect,
  SelectValue,
  Button as AriaButton,
  ListBox,
  ListBoxItem,
  Popover,
  type SelectProps as AriaSelectProps,
} from 'react-aria-components';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectProps<T extends object>
  extends Omit<AriaSelectProps<T>, 'className'> {
  className?: string;
  placeholder?: string;
}

function Select<T extends object>({
  className,
  placeholder,
  children,
  ...props
}: SelectProps<T>) {
  return (
    <AriaSelect className={cn('group', className)} {...props}>
      <AriaButton className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1">
        <SelectValue className="flex-1 text-left">
          {({ selectedText }) => selectedText || placeholder}
        </SelectValue>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </AriaButton>
      <Popover
        className={cn(
          'z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md',
          'data-[entering]:animate-in data-[exiting]:animate-out',
          'data-[entering]:fade-in-0 data-[exiting]:fade-out-0',
          'data-[entering]:zoom-in-95 data-[exiting]:zoom-out-95',
        )}
      >
        <ListBox className="p-1 outline-none max-h-96 overflow-auto">
          {children}
        </ListBox>
      </Popover>
    </AriaSelect>
  );
}

export interface SelectItemProps {
  className?: string;
  children: React.ReactNode;
  textValue: string;
  id: string;
  value: string;
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, value, ...props }, ref) => {
    return (
      <ListBoxItem
        ref={ref}
        id={value}
        textValue={props.textValue}
        className={cn(
          'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none',
          'focus:bg-accent focus:text-accent-foreground',
          'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          className,
        )}
      >
        {({ isSelected }) => (
          <>
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
              {isSelected && <Check className="h-4 w-4" />}
            </span>
            {children}
          </>
        )}
      </ListBoxItem>
    );
  },
);
SelectItem.displayName = 'SelectItem';

export { Select, SelectItem };
