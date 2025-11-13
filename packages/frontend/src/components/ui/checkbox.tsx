import * as React from 'react';
import { Check } from 'lucide-react';
import {
  Checkbox as AriaCheckbox,
  type CheckboxProps as AriaCheckboxProps,
} from 'react-aria-components';

import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<AriaCheckboxProps, 'children'> {
  className?: string;
}

const Checkbox = React.forwardRef<HTMLLabelElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      <AriaCheckbox
        ref={ref}
        className={cn(
          'group flex items-center gap-2',
          // Oh, all the tears I have shed for this single line.
          // See https://github.com/adobe/react-spectrum/issues/5094
          // And the official documentation
          // https://react-spectrum.adobe.com/react-aria/VisuallyHidden.html#gotchas
          'relative',
          className,
        )}
        {...props}
      >
        {({ isSelected }) => (
          <div
            className={cn(
              'h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background transition-smooth flex items-center justify-center',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              isSelected && 'bg-primary text-primary-foreground',
            )}
          >
            {isSelected && <Check className="h-4 w-4" />}
          </div>
        )}
      </AriaCheckbox>
    );
  },
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
