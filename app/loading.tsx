import { Spinner } from "@/components/ui/spinner";

const Loading = () => {
  return (
    <div className="w-dvw h-dvh flex flex-row items-center justify-center gap-4">
      <Spinner />
      Loading
    </div>
  );
};

export default Loading;
