import { Button } from '@/components/ui/button';

interface SRSControlsProps {
  onQualityClick: (quality: number) => void;
}

const SRSControls = ({ onQualityClick }: SRSControlsProps) => {
  return (
    <div className="flex justify-around">
      <Button variant="destructive" onClick={() => onQualityClick(0)}>
        Hard
      </Button>
      <Button variant="outline" onClick={() => onQualityClick(3)}>
        Good
      </Button>
      <Button variant="default" onClick={() => onQualityClick(5)}>
        Easy
      </Button>
    </div>
  );
};

export default SRSControls;
