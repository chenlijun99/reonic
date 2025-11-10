import * as React from 'react';
import {
  Modal,
  ModalOverlay,
  Dialog,
  DialogTrigger,
  Button,
} from 'react-aria-components';

import { cn } from '@/lib/utils';

interface DrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

const Drawer = ({ children, open, onOpenChange }: DrawerProps) => {
  return (
    <ModalOverlay
      isOpen={open}
      onOpenChange={onOpenChange}
      isDismissable
      className={cn(
        'fixed inset-0 z-50 bg-black/80',
        'data-[entering]:animate-in data-[exiting]:animate-out',
        'data-[entering]:fade-in-0 data-[exiting]:fade-out-0',
      )}
    >
      {children}
    </ModalOverlay>
  );
};

const DrawerTrigger = DialogTrigger;

const DrawerPortal = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

const DrawerClose = Button;

const DrawerOverlay = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('fixed inset-0 z-50 bg-black/80', className)}
    {...props}
  />
));
DrawerOverlay.displayName = 'DrawerOverlay';

interface DrawerContentProps {
  className?: string;
  children?: React.ReactNode;
}

const DrawerContent = React.forwardRef<HTMLDivElement, DrawerContentProps>(
  ({ className, children }, ref) => {
    return (
      <Modal
        ref={ref}
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 mt-24 flex flex-col rounded-t-[10px] border bg-background',
          'data-[entering]:animate-in data-[exiting]:animate-out',
          'data-[entering]:slide-in-from-bottom data-[exiting]:slide-out-to-bottom',
          'data-[entering]:duration-300 data-[exiting]:duration-200',
          className,
        )}
      >
        <Dialog className="outline-none flex flex-col h-full">
          <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
          {children}
        </Dialog>
      </Modal>
    );
  },
);
DrawerContent.displayName = 'DrawerContent';

const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('grid gap-1.5 p-4 text-center sm:text-left', className)}
    {...props}
  />
);
DrawerHeader.displayName = 'DrawerHeader';

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('mt-auto flex flex-col gap-2 p-4', className)}
    {...props}
  />
);
DrawerFooter.displayName = 'DrawerFooter';

const DrawerTitle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2
    className={cn(
      'text-lg font-semibold leading-none tracking-tight',
      className,
    )}
    {...props}
  />
);
DrawerTitle.displayName = 'DrawerTitle';

const DrawerDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-sm text-muted-foreground', className)} {...props} />
);
DrawerDescription.displayName = 'DrawerDescription';

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
