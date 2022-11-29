const EntityTag = ({ kind, className }) => {
    return (
        <div className={'uppercase inline-block items-center font-semibold text-gray-900/70 text-xxs px-1.5 py-0 bg-gray-200 tracking-wide rounded-full'}>
            {kind}
        </div>
    )
}


export default EntityTag