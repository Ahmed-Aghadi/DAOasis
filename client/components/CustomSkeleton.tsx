import { MantineNumberSize, Skeleton } from "@mantine/core";

interface SkeletonProps {
    variant?: string;
    /** Should skeleton overlay be displayed */
    visible?: boolean;
    /** Skeleton height */
    height?: number | string;
    /** Skeleton width */
    width?: number | string;
    /** If Skeleton is a circle, it's width and border-radius will be equal to height */
    circle?: boolean;
    /** Key of theme.radius or any valid CSS value to set border-radius, theme.defaultRadius by default */
    radius?: MantineNumberSize;
    /** Whether to show the animation effect */
    animate?: boolean;

    children?: React.ReactNode;
}

export function CustomSkeleton({ children, ...props }: SkeletonProps) {
    return (
        <Skeleton
            sx={(theme) => ({
                "&::before": {
                    background: theme.colors.blueTheme[2],
                },
                "&::after": {
                    background: theme.colors.blueTheme[3],
                },
            })}
            {...props}
        >
            {children}
        </Skeleton>
    );
}
