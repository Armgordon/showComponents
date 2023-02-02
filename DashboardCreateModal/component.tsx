import type { FC } from 'react';
import React from 'react';
import { Controller } from 'react-hook-form';
import classnames from 'classnames';
import { componentDisplayName } from '@components/common/utils';
import { useRenderers, useValidationRules } from '@components/common/forms/DashboardForm';
import PeriodGroup from '@components/common/ConstructModal/PeriodGroup';
import { ConstructModalType } from '@components/common/ConstructModal/types';
import { useFormId } from '@components/common/ConstructModal/utils/ConstructModalUtils';
import ConstructModal, { useRenderFooterCancelConfirm as useRenderFooter } from '@components/common/ConstructModal/';

import { useFormBehavior, useTitle } from './behavior';
import styles from './styles.scss';
import type { Props } from './types';

/** `DashboardCreateModal` component */
const Component: FC<Props> = ({ className, dashboardId, isOpen, onClose }) => {
  const formId = useFormId(ConstructModalType.DASHBOARD);
  const title = useTitle(dashboardId);
  const { isError, control, isLoading, onSubmit, onReset, periodTypeState, startDateState, endDateState, onSaveCache } =
    useFormBehavior(onClose, dashboardId);

  const rules = useValidationRules();
  const renderers = useRenderers(periodTypeState.value, isLoading);
  const renderFooter = useRenderFooter(formId, styles.button);
  const errorMessageClassNames = classnames(styles.errorMessage, {
    [styles.errorMessage_hidden]: !isError,
  });

  return (
    <ConstructModal
      isOpen={isOpen}
      onClose={onSaveCache}
      onResetClose={onReset}
      contentClassName={styles.content}
      className={classnames(styles.root, className)}
      title={title}
      renderFooter={renderFooter}
      footerClassName={styles.footer}
    >
      <div className={styles.leftSide}>
        <div className={errorMessageClassNames}>Не удалось создать дашборд</div>
        <h3>Название и конфигурация дашборда</h3>
        <form id={formId} onReset={onReset} onSubmit={onSubmit}>
          <Controller control={control} name="name" rules={rules.name} render={renderers.name} />
          <h4>Конфигурация дашборда</h4>
          <Controller
            control={control}
            name="widget_configuration"
            rules={rules.widget_configuration}
            render={renderers.widget_configuration}
          />
        </form>
      </div>
      <div className={styles.rightSide}>
        <form id={formId} onReset={onReset} onSubmit={onSubmit}>
          <h3>Период отображаемых данных дашборда</h3>
          <PeriodGroup
            value={periodTypeState.value}
            checkedValue={periodTypeState.value}
            startDateState={startDateState}
            endDateState={endDateState}
            onChange={periodTypeState.setValue}
          >
            <Controller control={control} name="last" rules={rules.last} render={renderers.last} />
            <Controller
              control={control}
              name="last_measure"
              rules={rules.last_measure}
              render={renderers.last_measure}
            />
          </PeriodGroup>
          <Controller control={control} name="group_by_period" render={renderers.group_by_period} />
        </form>
      </div>
    </ConstructModal>
  );
};
Component.displayName = componentDisplayName('DashboardCreateModal', __filename);

export default Component;
