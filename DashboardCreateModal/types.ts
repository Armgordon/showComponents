import type React from 'react';
import type { Control, ControllerProps, UseControllerReturn } from 'react-hook-form';
import type { BaseSyntheticEvent, ReactElement } from 'react';
import type { PeriodType } from '@domain';
import type { InputType } from '@components/common/Input';
import type { FormFieldState } from '@components/common/forms';
import type { CreateDashboardForm } from '@components/common/forms/DashboardForm';

export type FormFieldStateType<T> = [T, React.Dispatch<React.SetStateAction<T>>];

/** Form common behavior object */
export interface FormBehavior {
  /** Was error thrown during provider creation */
  isError: boolean;
  /** Is dashboard creation in progress */
  isLoading: boolean;
  /** Form control (from `react-hook-form`) */
  control: Control<CreateDashboardForm>;
  /** State of period_type dashboard field value for non-control elements */
  periodTypeState: FormFieldState<PeriodType>;
  /** State of start_date dashboard field value for non-control elements */
  startDateState: FormFieldState<string>;
  /** State of end_date dashboard field value for non-control elements */
  endDateState: FormFieldState<string>;

  /** Form reset handler */
  onReset(): void;

  /** Form submit handler */
  onSubmit(event?: BaseSyntheticEvent): Promise<void>;
}

/** Validation rules for concrete field */
export type ValidationRules<K extends keyof CreateDashboardForm> = ControllerProps<CreateDashboardForm, K>['rules'];

/** Form validation rules */
export type FormValidationRules = {
  /** Only for used field */
  [field in keyof Pick<
    CreateDashboardForm,
    'name' | 'period_type' | 'last' | 'last_measure' | 'widget_configuration'
  >]: ControllerProps<
    Pick<CreateDashboardForm, 'name' | 'period_type' | 'last' | 'last_measure' | 'widget_configuration'>,
    field
  >['rules'];
};

/** Input field renderer parameters */
export type RendererParams<K extends keyof CreateDashboardForm> = UseControllerReturn<CreateDashboardForm, K>;

/** Input field renderer */
export type Renderer<K extends keyof CreateDashboardForm> = (params: RendererParams<K>) => ReactElement;

/** Form input fields renderers (`useRenderers` hook result) */
export type FormRenderers = {
  [field in keyof CreateDashboardForm]: Renderer<field>;
};

/** `useRenderer` hook parameters */
export interface UseRendererParams {
  /** Type of input to render */
  type: InputType;
  /** Name of field */
  fieldName: keyof Pick<CreateDashboardForm, 'name'>;
  /** Is provider creation in progress */
  isLoading: boolean;
  /** Field placeholder */
  placeholder: string;
  /** Field label */
  label: string;
}

/** `DashboardCreateModal` component properties */
export interface Props {
  /** Additional CSS class */
  className?: string;
  /** Identifier of dashboard to edit. If not defined then new provider will be created on submit. */
  dashboardId?: number | null | undefined;
  /** Is create dashboard modal open */
  isOpen: boolean;

  /** Provider editor close handler */
  onClose(): void;
}
