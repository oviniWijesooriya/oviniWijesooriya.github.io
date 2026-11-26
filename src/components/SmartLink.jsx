import { Link } from 'react-router-dom'

/** A link typed into the dashboard: in-site paths use the router, web addresses open a new tab. */
export default function SmartLink({ href = '', children, ...rest }) {
  if (href.startsWith('/') && !href.startsWith('//')) {
    return (
      <Link to={href} {...rest}>
        {children}
      </Link>
    )
  }
  // Only ordinary link schemes: anything else (such as javascript:) is dropped.
  const safe = /^(https?:|mailto:|tel:|#)/i.test(href) ? href : '#'
  const external = /^https?:/i.test(safe)
  return (
    <a href={safe} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})} {...rest}>
      {children}
    </a>
  )
}
