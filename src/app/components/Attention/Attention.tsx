import BaseIcon from "#components/icons/BaseIcon.tsx";
import IconWarning from "#components/icons/IconWarning.tsx";

interface Props {
    label: string;
    variant?: keyof typeof Variants;
}

enum Variants {
    "default" = "border-fireDragonBright text-fireDragonBright fill-fireDragonBright",
    "destructive" = "border-wildRiderRed text-wildRiderRed fill-wildRiderRed",
}

const Attention = ({ label, variant = "default" }: Props) => {
    return (
        <div className={`border-1 gap-2 p-2 flex items-center ${Variants[variant]}`}>
            <BaseIcon color="inherit">
                <IconWarning />
            </BaseIcon>
            <span className="grow">{label}</span>
        </div>
    );
};

export default Attention;
