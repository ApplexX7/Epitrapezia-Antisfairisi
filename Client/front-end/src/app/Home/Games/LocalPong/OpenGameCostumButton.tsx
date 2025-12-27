
import { Button } from "@/components/ui/button";

type OpenButtonProps = 
{
    isOpen: boolean;
    setIsOpen : React.Dispatch<React.SetStateAction<boolean>>;
}

export default function OpenGameCostumButton({isOpen, setIsOpen} : OpenButtonProps)
{

    const handleSettingsOpen = () =>
    {
        setIsOpen(true);
    }
    return (<>

    <Button onClick={handleSettingsOpen}>
        openSettings
    </Button>
    </>)
}