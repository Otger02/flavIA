import { getTranslations } from "next-intl/server";

type ChatUpgradeNoticeProps = {
  message?: string;
};

export async function ChatUpgradeNotice({
  message,
}: ChatUpgradeNoticeProps) {
  const t = await getTranslations("billing");
  const resolvedMessage = message ?? t("upgrade_notice.default_message");

  return (
    <div className="mb-4 rounded-2xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
      {resolvedMessage}
    </div>
  );
}