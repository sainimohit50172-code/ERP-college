import React from 'react'

const ERPTable = React.forwardRef(function ERPTable({ id, className = '', style, children, ...props }, ref) {
  return (
    <table ref={ref} id={id} className={`min-w-full ${className}`} style={style} {...props}>
      {children}
    </table>
  )
})

export default ERPTable
