import clsx from 'clsx';

export default function Skeleton({ className }) {
    return (
        <div className={clsx("animate-pulse bg-emerald-100/50 rounded-lg", className)}></div>
    );
}