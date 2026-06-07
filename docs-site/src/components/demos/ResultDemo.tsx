import { TkxResult, TkxButton } from 'tekivex-ui';
import { Preview } from '../Preview';

export function ResultSuccess() {
  return (
    <Preview label="Success state">
      <TkxResult
        status="success"
        title="Payment received"
        subTitle="Order #84291 has been confirmed. A receipt has been sent to you@example.com."
        extra={<TkxButton variant="primary">View order</TkxButton>}
      />
    </Preview>
  );
}

export function ResultError() {
  return (
    <Preview label="Error state">
      <TkxResult
        status="error"
        title="Something went wrong"
        subTitle="The deploy failed at the Astro overlay step. Check the build log."
        extra={<TkxButton variant="primary">Retry</TkxButton>}
      />
    </Preview>
  );
}

export function ResultFourOhFour() {
  return (
    <Preview label="404 page">
      <TkxResult
        status="404"
        title="Page not found"
        subTitle="That URL doesn't exist on the site."
        extra={<TkxButton variant="primary">Go home</TkxButton>}
      />
    </Preview>
  );
}
