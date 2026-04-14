import { Spinner } from "@/components/ui/spinner";

export default function ProfileLoading() {
  return (
    <div className="flex h-96 items-center justify-center">
      <Spinner className="h-6 w-6" />
    </div>
  );
}
