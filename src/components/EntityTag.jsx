const EntityTag = ({ kind, className }) => {
    return (
        <div className={'uppercase text-center font-semibold text-gray-900/70 text-xxs px-1.5 leading-3 bg-gray-200 tracking-wide rounded-full ' + className }>
            {kind}
        </div>
    )
}


export default EntityTag