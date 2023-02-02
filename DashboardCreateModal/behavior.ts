import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { isNil } from 'lodash';
import { updateCurrentDashboard, saveListDashboard } from '@store/dashboards';
import { CachedForms, dashboardsActions } from '@store/modals';
import { WidgetConfiguration, PeriodType, TimeMeasures } from '@domain';
import { useCacheById, useDashboardById } from '@components/common/customHooks';
import { useCurrentDashboard } from '@components/common/customHooks/DashboardsHooks';
import { useDashboardFormSubState } from '@components/common/forms/DashboardForm';
import type { CreateDashboardForm, UpdateDashboardForm } from '@components/common/forms/DashboardForm';
import type { AnalyticsFormBehavior } from '@components/common/forms';
import { getUser } from '@store/auth';
import { getClearUnusedFields, getCurrenUserAccess } from '@components/common/formUtils/common/createItemFormUtils';

/* eslint-disable camelcase */

/**
 * Hook which returns dashboard editor modal title
 * @param [dashboardId] Identifier of dashboard to edit
 * @returns Title (`string` type)
 */
export const useTitle = (dashboardId?: number | null): string =>
  isNil(dashboardId) ? 'Создание дашборда' : 'Редактирование дашборда';

/**
 * Hook which returns default values for dashboard edit form
 *
 * @param dashboardId Received dashboard values to edit (see {@link CreateDashboardForm} for further information)
 * @returns Memoized {@link CreateDashboardForm} default value
 */
export const useDefaultValues = (dashboardId?: number | null): CreateDashboardForm => {
  const dashboardFromList = useDashboardById(dashboardId);
  const singleDashboard = useCurrentDashboard();
  const cachedDashboard = useCacheById<CreateDashboardForm>({
    entityId: dashboardId,
    modalName: CachedForms.DASHBOARDS,
  });

  let dashboard: CreateDashboardForm | undefined;
  if (cachedDashboard) dashboard = cachedDashboard;
  else if (dashboardId && singleDashboard) dashboard = singleDashboard;
  else dashboard = dashboardFromList;

  return useMemo(
    (): CreateDashboardForm => ({
      name: dashboard?.name || '',
      period_type: dashboard?.period_type || PeriodType.USER,
      last: dashboard?.last || 0,
      last_measure: dashboard?.last_measure || TimeMeasures.DAYS,
      start_date: dashboard?.start_date || null,
      end_date: dashboard?.end_date || null,
      user_start_date: dashboard?.user_start_date || null,
      user_end_date: dashboard?.user_end_date || null,
      widget_configuration: dashboard?.widget_configuration || WidgetConfiguration.ONE,
      group_by_period: dashboard?.group_by_period || TimeMeasures.DAYS,
      users_with_access: dashboard?.users_with_access || [],
    }),
    [
      dashboard?.name,
      dashboard?.period_type,
      dashboard?.last,
      dashboard?.last_measure,
      dashboard?.start_date,
      dashboard?.end_date,
      dashboard?.user_start_date,
      dashboard?.user_end_date,
      dashboard?.widget_configuration,
      dashboard?.group_by_period,
      dashboard?.users_with_access,
    ],
  );
};

/**
 * Hook which initialize and return base form behavior entities
 * @param onClose Dashboard editor modal close handler (from `onClose` property)
 * @param [dashboardId] Identifier of dashboard to edit
 * @returns Form behavior object (see {@link AnalyticsFormBehavior<CreateDashboardForm>} for further information).
 */
export const useFormBehavior = (
  onClose: () => unknown,
  dashboardId?: number | null,
): AnalyticsFormBehavior<CreateDashboardForm> => {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector(getUser);

  const defaultValues = useDefaultValues(dashboardId);
  const isSingleDashboard = useCurrentDashboard();

  const {
    control,
    reset,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateDashboardForm>({
    defaultValues,
  });

  const formValues = watch();
  const onCloseInternal = useCallback(() => {
    setIsError(false);
    setIsLoading(false);
    onClose();
  }, [onClose, setIsError, setIsLoading]);

  const onSaveCache = useCallback(() => {
    dispatch(dashboardsActions.setCache({ entityId: dashboardId, values: formValues }));
    onCloseInternal();
  }, [dashboardId, dispatch, formValues, onCloseInternal]);

  const onClearCache = useCallback(() => dispatch(dashboardsActions.clearCache()), [dispatch]);

  const { periodTypeState, startDateState, endDateState } = useDashboardFormSubState(watch, setValue);

  const onReset = useCallback(() => {
    onClearCache();
    reset(defaultValues);
    onCloseInternal();
  }, [onCloseInternal, defaultValues, reset, onClearCache]);

  const onSubmitSuccess = useCallback(
    async (body: CreateDashboardForm | UpdateDashboardForm) => {
      setIsError(false);
      setIsLoading(true);

      try {
        const emptyUnusedFields = await getClearUnusedFields(body);

        const updateParams: CreateDashboardForm | UpdateDashboardForm = {
          ...body,
          ...emptyUnusedFields,
        };

        const resultUpdateParams: CreateDashboardForm | UpdateDashboardForm = dashboardId
          ? { ...updateParams, id: dashboardId }
          : { ...updateParams, users_with_access: getCurrenUserAccess(user!) };

        if (!isSingleDashboard) await dispatch(saveListDashboard(resultUpdateParams));
        else await dispatch(updateCurrentDashboard(<UpdateDashboardForm>resultUpdateParams));
        onReset();
      } catch (err) {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    },
    [dashboardId, isSingleDashboard, dispatch, onReset, user],
  );

  const onSubmit = useMemo(() => handleSubmit(onSubmitSuccess), [handleSubmit, onSubmitSuccess]);

  useEffect(() => reset(defaultValues), [reset, defaultValues]);

  return {
    isError,
    isLoading,
    control,
    onReset,
    onSaveCache,
    onSubmit,
    periodTypeState,
    startDateState,
    endDateState,
    errors,
    watch,
  };
};
