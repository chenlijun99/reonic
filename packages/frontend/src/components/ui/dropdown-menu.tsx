import * as React from 'react';
import {
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
  Separator,
  type MenuItemProps,
  type PopoverProps,
} from 'react-aria-components';
import { Check, ChevronRight, Circle } from 'lucide-react';

import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const DropdownMenu = MenuTrigger;

const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => <Button ref={ref} {...props} />,
);
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

const DropdownMenuGroup = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>;

const DropdownMenuPortal = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

const DropdownMenuSub = Menu;

const DropdownMenuRadioGroup = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>;

interface DropdownMenuSubTriggerProps extends Omit<MenuItemProps, 'children'> {
  className?: string;
  inset?: boolean;
  children?: React.ReactNode;
}

const DropdownMenuSubTrigger = React.forwardRef<
  HTMLDivElement,
  DropdownMenuSubTriggerProps
>(({ className, inset, children, ...props }, ref) => (
  <MenuItem
    ref={ref}
    className={cn(
      'flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
      'focus:bg-accent focus:text-accent-foreground',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      inset && 'pl-8',
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </MenuItem>
));
DropdownMenuSubTrigger.displayName = 'DropdownMenuSubTrigger';

interface DropdownMenuSubContentProps extends Omit<PopoverProps, 'children'> {
  className?: string;
  children?: React.ReactNode;
}

const DropdownMenuSubContent = React.forwardRef<
  HTMLDivElement,
  DropdownMenuSubContentProps
>(({ className, children, ...props }, ref) => (
  <Popover
    ref={ref}
    className={cn(
      'z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg',
      'data-[entering]:animate-in data-[exiting]:animate-out',
      'data-[entering]:fade-in-0 data-[exiting]:fade-out-0',
      'data-[entering]:zoom-in-95 data-[exiting]:zoom-out-95',
      className,
    )}
    {...props}
  >
    <Menu className="outline-none">{children}</Menu>
  </Popover>
));
DropdownMenuSubContent.displayName = 'DropdownMenuSubContent';

interface DropdownMenuContentProps extends Omit<PopoverProps, 'children'> {
  className?: string;
  sideOffset?: number;
  children?: React.ReactNode;
}

const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  DropdownMenuContentProps
>(({ className, sideOffset = 4, children, ...props }, ref) => (
  <Popover
    ref={ref}
    offset={sideOffset}
    className={cn(
      'z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md',
      'data-[entering]:animate-in data-[exiting]:animate-out',
      'data-[entering]:fade-in-0 data-[exiting]:fade-out-0',
      'data-[entering]:zoom-in-95 data-[exiting]:zoom-out-95',
      className,
    )}
    {...props}
  >
    <Menu className="outline-none">{children}</Menu>
  </Popover>
));
DropdownMenuContent.displayName = 'DropdownMenuContent';

interface DropdownMenuItemProps extends Omit<MenuItemProps, 'children'> {
  className?: string;
  inset?: boolean;
  children?: React.ReactNode;
}

const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  DropdownMenuItemProps
>(({ className, inset, children, ...props }, ref) => (
  <MenuItem
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
      'focus:bg-accent focus:text-accent-foreground',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      inset && 'pl-8',
      className,
    )}
    {...props}
  >
    {children}
  </MenuItem>
));
DropdownMenuItem.displayName = 'DropdownMenuItem';

interface DropdownMenuCheckboxItemProps
  extends Omit<MenuItemProps, 'children'> {
  className?: string;
  checked?: boolean;
  children?: React.ReactNode;
}

const DropdownMenuCheckboxItem = React.forwardRef<
  HTMLDivElement,
  DropdownMenuCheckboxItemProps
>(({ className, children, checked, ...props }, ref) => (
  <MenuItem
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors',
      'focus:bg-accent focus:text-accent-foreground',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      {checked && <Check className="h-4 w-4" />}
    </span>
    {children}
  </MenuItem>
));
DropdownMenuCheckboxItem.displayName = 'DropdownMenuCheckboxItem';

interface DropdownMenuRadioItemProps extends Omit<MenuItemProps, 'children'> {
  className?: string;
  checked?: boolean;
  children?: React.ReactNode;
}

const DropdownMenuRadioItem = React.forwardRef<
  HTMLDivElement,
  DropdownMenuRadioItemProps
>(({ className, children, checked, ...props }, ref) => (
  <MenuItem
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors',
      'focus:bg-accent focus:text-accent-foreground',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      {checked && <Circle className="h-2 w-2 fill-current" />}
    </span>
    {children}
  </MenuItem>
));
DropdownMenuRadioItem.displayName = 'DropdownMenuRadioItem';

const DropdownMenuLabel = ({
  className,
  inset,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }) => (
  <div
    className={cn(
      'px-2 py-1.5 text-sm font-semibold',
      inset && 'pl-8',
      className,
    )}
    {...props}
  />
);
DropdownMenuLabel.displayName = 'DropdownMenuLabel';

const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Separator>
>(({ className, ...props }, ref) => (
  <Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-muted', className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn('ml-auto text-xs tracking-widest opacity-60', className)}
      {...props}
    />
  );
};
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut';

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};
