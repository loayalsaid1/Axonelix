import { memo } from "react"

type SvgProps = React.ComponentPropsWithoutRef<"svg">

export const YoutubeIcon = memo(({ className, ...props }: SvgProps) => {
  return (
    <svg
      width="24"
      height="24"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M21.5821 7.39304C21.4532 6.92798 21.209 6.50089 20.8718 6.1515C20.5346 5.80211 20.1156 5.54202 19.6531 5.39554C18.0001 5 12.0001 5 12.0001 5C12.0001 5 6.00014 5 4.34714 5.39554C3.88464 5.54202 3.46557 5.80211 3.12839 6.1515C2.79121 6.50089 2.54698 6.92798 2.41814 7.39304C2.14629 9.04089 2.01114 10.7089 2.01514 12.3795C2.00964 14.0535 2.14479 15.7248 2.41814 17.375C2.54698 17.8401 2.79121 18.2672 3.12839 18.6166C3.46557 18.966 3.88464 19.226 4.34714 19.3725C6.00014 19.768 12.0001 19.768 12.0001 19.768C12.0001 19.768 18.0001 19.768 19.6531 19.3725C20.1156 19.226 20.5346 18.966 20.8718 18.6166C21.209 18.2672 21.4532 17.8401 21.5821 17.375C21.8535 15.7248 21.9887 14.0535 21.9851 12.3795C21.9906 10.7089 21.8555 9.04089 21.5821 7.39304Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.0001 15.076L15.2051 12.38L10.0001 9.684V15.076Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

YoutubeIcon.displayName = "YoutubeIcon"
