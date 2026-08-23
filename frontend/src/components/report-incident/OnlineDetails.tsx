'use client';

import { TextQuestion } from './TextQuestion';
import { WhenQuestion } from './WhenQuestion';
import type { StepBodyProps } from './step-body';

export function OnlineDetails({ report, errors, set }: StepBodyProps) {
  return (
    <div className="space-y-5">
      <TextQuestion
        id="online_platform"
        label="Where online did the incident occur?"
        helper="The platform, site, or service where you encountered it."
        placeholder="For example: Instagram, TikTok, X, Reddit, Facebook, email, website..."
        value={report.online_platform}
        error={errors.online_platform}
        onChange={(value) => set('online_platform', value)}
      />

      <TextQuestion
        id="online_url"
        label="Link to the post, page, profile, message, or other online content"
        helper="If you still have access to the link, paste it here. You can leave this blank if the content was removed or you do not have the URL."
        placeholder="https://..."
        type="url"
        inputMode="url"
        optional
        value={report.online_url}
        onChange={(value) => set('online_url', value)}
      />

      <TextQuestion
        id="online_account"
        label="What account, username, website, or person was involved?"
        placeholder="For example: @username, website name, account name, email address..."
        optional
        value={report.online_account}
        onChange={(value) => set('online_account', value)}
      />

      <TextQuestion
        id="target"
        label="Who or what was targeted?"
        helper="Tell us who or what you believe was targeted."
        placeholder="For example: me, another person, Muslims generally, a mosque, an organization..."
        value={report.target}
        onChange={(value) => set('target', value)}
      />

      <WhenQuestion report={report} errors={errors} set={set} />

      <TextQuestion
        id="still_happening"
        label="Is the incident still happening?"
        placeholder="For example: No, Yes, Unsure — include any details that may help."
        value={report.still_happening}
        onChange={(value) => set('still_happening', value)}
      />
    </div>
  );
}
