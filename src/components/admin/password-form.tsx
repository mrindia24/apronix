'use client';

import { FormShell } from '@/src/components/admin/form-shell';
import { Field, SubmitButton, inputClass, Card } from '@/src/components/admin/ui';
import { changePasswordAction } from '@/src/lib/actions/auth';

export function PasswordForm() {
  return (
    <Card
      title="Change your password"
      description="Minimum 12 characters with upper and lower case letters and a number. Changing your password signs out all other sessions."
    >
      <FormShell action={changePasswordAction}>
        {(state) => (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Current password" name="currentPassword" error={state.errors?.currentPassword}>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  required
                  className={inputClass}
                />
              </Field>
              <Field label="New password" name="newPassword" error={state.errors?.newPassword}>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={12}
                  className={inputClass}
                />
              </Field>
              <Field label="Confirm new password" name="confirmPassword" error={state.errors?.confirmPassword}>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={12}
                  className={inputClass}
                />
              </Field>
            </div>
            <SubmitButton variant="secondary">Update password</SubmitButton>
          </div>
        )}
      </FormShell>
    </Card>
  );
}
