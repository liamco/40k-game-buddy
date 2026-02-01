interface Props {
    color?: string;
}

const HorizontalRule = ({ color = "skarsnikGreen" }: Props) => {
    return <hr className={`border-none w-full h-[1px] bg-${color}`} />;
};

export default HorizontalRule;
