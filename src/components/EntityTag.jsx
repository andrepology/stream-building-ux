const EntityTag = ({ kind }) => {
    return (
        <div className='uppercase text-center inline-block font-semibold text-gray-900/70 text-xxs px-1.5 py-0.5 bg-gray-200 tracking-wide rounded-full'>
            {kind}
        </div>
    )
}


export default EntityTag