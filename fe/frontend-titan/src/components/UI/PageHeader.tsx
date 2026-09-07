interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="mb-gap-lg">
      <div className="flex items-center gap-gap-xs">
        <div className="w-1 h-7 bg-primary-container rounded-full" />
        <h1 className="font-headline-md text-headline-md uppercase text-on-surface m-0">{title}</h1>
      </div>
      {subtitle && <p className="text-on-surface-variant font-body-sm text-body-sm mt-1 ml-gap-sm">{subtitle}</p>}
    </div>
  );
}

export default PageHeader;
