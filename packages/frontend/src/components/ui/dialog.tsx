import * as React from 'react';
import {
  Modal,
  ModalOverlay,
  Dialog as AriaDialog,
} from 'react-aria-components';

import { cn } from '@/lib/utils';

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

const Dialog = ({ children, open, onOpenChange }: DialogProps) => {
  return (
    <ModalOverlay
      isOpen={open}
      onOpenChange={onOpenChange}
      isDismissable
      className={cn(
        'fixed inset-0 z-50 bg-black/80 data-[entering]:animate-in data-[exiting]:animate-out data-[entering]:fade-in-0 data-[exiting]:fade-out-0',
        'flex items-center justify-center p-4',
      )}
    >
      {children}
    </ModalOverlay>
  );
};

interface DialogContentProps {
  className?: string;
  children?: React.ReactNode;
}

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children }, ref) => {
    return (
      <Modal
        ref={ref}
        className={cn(
          'relative z-50 grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg',
          'data-[entering]:animate-in data-[exiting]:animate-out',
          'data-[entering]:fade-in-0 data-[exiting]:fade-out-0',
          'data-[entering]:zoom-in-95 data-[exiting]:zoom-out-95',
          'sm:rounded-lg',
          className,
        )}
      >
        <AriaDialog className="outline-none">{children}</AriaDialog>
      </Modal>
    );
  },
);
DialogContent.displayName = 'DialogContent';

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 text-center sm:text-left',
      className,
    )}
    {...props}
  />
);
DialogHeader.displayName = 'DialogHeader';

const DialogTitle = ({
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
DialogTitle.displayName = 'DialogTitle';

export { Dialog, DialogContent, DialogHeader, DialogTitle };
