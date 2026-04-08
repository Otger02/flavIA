type ChatUpgradeNoticeProps = {
  message?: string;
};

export function ChatUpgradeNotice({
  message = "Has llegado al limite gratuito",
}: ChatUpgradeNoticeProps) {
  return (
    <div className="mb-4 rounded-2xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
      {message}
    </div>
  );
}