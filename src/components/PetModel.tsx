import PetRenderer from "./PetRenderer";

interface PetModelProps {
  mood?: string;
  petType?: string;
  toyPosition?: [number, number, number];
  showToy?: boolean;
  isInteracting?: boolean;
  interactionType?: 'pet' | 'feed' | 'toy' | 'none';
}

export default function PetModel({
  mood = "idle",
  petType = "dog",
  toyPosition = [0, -0.4, 0],
  showToy = false,
  isInteracting = false,
  interactionType = 'none'
}: PetModelProps) {
  const type = petType === "cat" ? "cat" : "dog";

  return (
    <PetRenderer
      petType={type}
      mood={mood}
      toyPosition={toyPosition}
      showToy={showToy}
      isInteracting={isInteracting}
      interactionType={interactionType}
    />
  );
}
