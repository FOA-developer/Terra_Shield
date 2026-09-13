export default function PageHeader({ title, subtitle, right }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3.5">
      <div>
        <div className="text-2xl font-bold tracking-tight text-forest-800 lg:text-[31px]">{title}</div>
        {subtitle && <div className="mt-1.5 text-[15px] text-gray-500">{subtitle}</div>}
      </div>
      {right}
    </div>
  )
}
