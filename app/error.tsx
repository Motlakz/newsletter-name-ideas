"use client"

import Error from "../components/common/error"

type ErrorProps = {
    error: Error & { digest?: string }
    reset: () => void
}

const ErrorPage = ({ error, reset }: ErrorProps) => {
    return (
        <Error error={error} reset={reset} />
    )
}

export default ErrorPage