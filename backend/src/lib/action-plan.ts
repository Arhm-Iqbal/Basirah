import type { ActionStep, IncidentActionPlan } from '@basirah/shared';

type PlatformGuide = {
  label: string;
  title: string;
  detail: string;
  url?: string;
  linkLabel?: string;
};

const PLATFORM_GUIDES: Record<string, PlatformGuide> = {
  facebook: {
    label: 'Facebook',
    title: 'Report it to Facebook',
    detail:
      'Open the post, comment, message, profile, or group, select the three-dot menu, choose Report, and select Hate speech, Harassment, or Threats and violence. If Facebook leaves it up, open Help and support → Support Inbox → Reports about others and request another review when that option is offered.',
    url: 'https://www.facebook.com/help/134552198624586/',
    linkLabel: 'Open Facebook reporting help',
  },
  instagram: {
    label: 'Instagram',
    title: 'Report it to Instagram',
    detail:
      'Open the post, comment, message, Story, or profile, select the three-dot menu, choose Report, and follow the prompts for Hate speech or symbols, Bullying or harassment, or Violence or dangerous organizations.',
    url: 'https://help.instagram.com/165828726894770',
    linkLabel: 'Open Instagram reporting help',
  },
  threads: {
    label: 'Threads',
    title: 'Report it to Threads',
    detail:
      'Open the post or profile, select the three-dot menu, choose Report, and follow the prompts for hate speech, harassment, or threats. Save the decision shown in your Meta support notifications.',
    url: 'https://help.instagram.com/165828726894770',
    linkLabel: 'Open Meta reporting help',
  },
  x: {
    label: 'X',
    title: 'Report it to X',
    detail:
      'Open the post, profile, or Direct Message, select the more menu, choose Report, identify who is being targeted, and include any related posts when X asks for context. For a violent threat, use Email report on X’s confirmation screen to keep a copy.',
    url: 'https://help.x.com/en/safety-and-security/report-abusive-behavior',
    linkLabel: 'Open X reporting help',
  },
  tiktok: {
    label: 'TikTok',
    title: 'Report it to TikTok',
    detail:
      'Open the post and tap Share, or press and hold it, then choose Report. Select the closest hate, harassment, or violence reason, add the requested context, and submit. Report the account separately if the account itself is dedicated to abuse.',
    url: 'https://support.tiktok.com/en/safety-hc/report-a-problem/report-a-video',
    linkLabel: 'Open TikTok reporting help',
  },
  youtube: {
    label: 'YouTube',
    title: 'Report it to YouTube',
    detail:
      'Open the video, Short, comment, live chat, or Community post, select the more menu, choose Report, and select the reason that best fits. Include timestamps for hate or threats in a video. Report a channel separately when its profile or overall purpose also violates the rules.',
    url: 'https://support.google.com/youtube/answer/2802027',
    linkLabel: 'Open YouTube reporting help',
  },
  reddit: {
    label: 'Reddit',
    title: 'Report it to Reddit',
    detail:
      'Use Report on the specific post, comment, chat message, or account and choose the site-wide hate, harassment, or threatening-violence reason. Reporting the exact content gives Reddit’s moderators the evidence they need.',
    url: 'https://support.reddithelp.com/hc/en-us/sections/360008810132-Reporting',
    linkLabel: 'Open Reddit reporting help',
  },
  linkedin: {
    label: 'LinkedIn',
    title: 'Report it to LinkedIn',
    detail:
      'Open the post, comment, message, or profile, select the more menu, choose Report, and select Hateful speech, Harassment, or Threats or violence. LinkedIn does not tell the reported person who submitted the report.',
    url: 'https://www.linkedin.com/help/linkedin/answer/a1336329/harassment-or-safety-concern?lang=en',
    linkLabel: 'Open LinkedIn reporting help',
  },
  snapchat: {
    label: 'Snapchat',
    title: 'Report it to Snapchat',
    detail:
      'Press and hold the Snap, Story, chat message, account, or other content and tap Report. Choose the hate speech, bullying or harassment, or threats and violence reason. A report made in the app includes the content Snapchat needs to review it.',
    url: 'https://help.snapchat.com/hc/en-us/articles/7012399221652',
    linkLabel: 'Open Snapchat reporting help',
  },
  discord: {
    label: 'Discord',
    title: 'Report it to Discord',
    detail:
      'Press and hold the message on mobile, or right-click it on desktop, choose Report Message, and follow the in-app safety prompts. Report the specific message rather than only the server so Discord receives the relevant context.',
    url: 'https://support.discord.com/hc/en-us/articles/22582288274071-Reporting-Abusive-Behavior-to-Discord',
    linkLabel: 'Open Discord reporting help',
  },
  telegram: {
    label: 'Telegram',
    title: 'Report it to Telegram',
    detail:
      'Tap the message on Android, press and hold it on iPhone, or right-click it on desktop, then choose Report and the closest reason. For public illegal content, Telegram also accepts links such as t.me URLs at abuse@telegram.org.',
    url: 'https://telegram.org/faq#q-there-39s-illegal-content-on-telegram-how-do-i-take-it-down',
    linkLabel: 'Open Telegram reporting help',
  },
  twitch: {
    label: 'Twitch',
    title: 'Report it to Twitch',
    detail:
      'Report directly from the live stream, VOD, clip, chat message, Whisper, or user profile. Choose the closest hateful-conduct, harassment, or threats category and describe where the violation appears.',
    url: 'https://help.twitch.tv/s/article/how-to-file-a-user-report',
    linkLabel: 'Open Twitch reporting help',
  },
  bluesky: {
    label: 'Bluesky',
    title: 'Report it to Bluesky',
    detail:
      'Open the post, message, feed, list, or account, select the three-dot menu, choose Report, and select the closest hate, harassment, or threat reason. Report the specific content so moderators receive its context.',
    url: 'https://blueskyweb.zendesk.com/hc/en-us/articles/19002427251981-Moderation-and-Custom-Feeds',
    linkLabel: 'Open Bluesky moderation help',
  },
  whatsapp: {
    label: 'WhatsApp',
    title: 'Report it to WhatsApp',
    detail:
      'Open the chat, tap the contact or group name, scroll to Report, and follow the prompts. You can report and block together. Save the messages first if you may need them, because blocking or deleting a chat can make your own copy harder to retrieve.',
    url: 'https://faq.whatsapp.com/',
    linkLabel: 'Open WhatsApp Help Centre',
  },
  email: {
    label: 'email',
    title: 'Report and block the sender',
    detail:
      'Save the original message, including its full headers, then use your email provider’s report abuse, spam, or phishing control and block the sender. Do not forward a threat as plain text; keep the original message because its headers may matter.',
  },
  website: {
    label: 'the website or forum',
    title: 'Report it to the site',
    detail:
      'Use the report control on the exact post, comment, profile, or page. If the site has no visible control, use its moderation, safety, or abuse contact and include the full URL, date, account name, and a short description of the rule being violated.',
  },
  other: {
    label: 'the platform',
    title: 'Report it on the platform',
    detail:
      'Use the report control on the exact post, message, account, or page and choose the closest hate, harassment, or threat reason. If there is no report control, look for the platform’s official safety, moderation, or abuse page.',
  },
};

const PLATFORM_ALIASES: Record<string, string> = {
  twitter: 'x',
  'x / twitter': 'x',
  fb: 'facebook',
  insta: 'instagram',
  ig: 'instagram',
  yt: 'youtube',
  'linked in': 'linkedin',
  snap: 'snapchat',
  'a website or forum': 'website',
  'somewhere else': 'other',
};

const VICTIM_SERVICES = {
  label: 'Find victim services near you',
  url: 'https://www.justice.gc.ca/eng/cj-jp/victims-victimes/vsd-rsv/index.html',
};

const HUMAN_RIGHTS = {
  label: 'Find your human rights agency',
  url: 'https://www.canada.ca/en/canadian-heritage/services/human-rights-complaints/provincial-territorial-agencies.html',
};

const NCCM = {
  label: 'Open NCCM’s incident form',
  url: 'https://www.nccm.ca/report-an-incident/',
};

function stringDetail(details: Record<string, unknown>, key: string): string {
  const value = details[key];
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function selected(details: Record<string, unknown>, key: string, value: string): boolean {
  return stringDetail(details, key)
    .split(',')
    .map((part) => part.trim())
    .includes(value);
}

function platformGuide(details: Record<string, unknown>): PlatformGuide {
  const raw = stringDetail(details, 'online_platform');
  const key = PLATFORM_ALIASES[raw] ?? raw;
  return PLATFORM_GUIDES[key] ?? PLATFORM_GUIDES.other;
}

function onlinePlan(details: Record<string, unknown>): IncidentActionPlan {
  const guide = platformGuide(details);
  const hasThreat = selected(details, 'online_harm', 'threats');
  const hasDoxxing = selected(details, 'online_harm', 'doxxing');
  const steps: ActionStep[] = [
    {
      title: 'Save the evidence before reporting it',
      detail:
        'Capture the full post or message, account name, date and time, and URL. Keep the surrounding conversation and original files where possible. Do not crop away context, and do not repost the hate publicly to document it.',
    },
    {
      title: guide.title,
      detail: guide.detail,
      ...(guide.url
        ? { link: { label: guide.linkLabel ?? `Open ${guide.label} help`, url: guide.url } }
        : {}),
    },
    {
      title: 'Protect your account and reduce contact',
      detail:
        'After saving the evidence and submitting the report, mute or block the account if that feels safe. Review who can mention, message, tag, or locate you, and turn on two-factor authentication if the account itself may be at risk.',
    },
  ];

  if (hasThreat || hasDoxxing) {
    steps.push({
      title: hasThreat
        ? 'Treat a credible threat as a safety issue'
        : 'Treat exposed personal information as a safety issue',
      detail: hasThreat
        ? 'If the message describes an immediate plan or you fear someone is in danger, call 911. Otherwise, contact local police through their non-emergency line and keep the original message, URL, account name, and platform report confirmation.'
        : 'If an address, workplace, school, or other identifying information was exposed, tell anyone whose safety is affected, tighten account privacy, and contact local police through their non-emergency line if the post creates a credible risk.',
    });
  } else {
    steps.push({
      title: 'Keep the platform’s decision',
      detail:
        'Save the report confirmation, reference number, and final decision. If the platform leaves the content up and offers a review or appeal, request it from the report-status screen or support inbox and explain briefly why the content targets Muslims or Islam with hate, harassment, or threats.',
    });
  }

  steps.push({
    title: 'Use community support if you want it',
    detail:
      'Basirah records the incident, but it does not submit the platform report for you. The National Council of Canadian Muslims also accepts anti-Muslim incident reports and may be able to provide advocacy or a referral.',
    link: NCCM,
  });

  return {
    channel: 'online',
    urgency: hasThreat || hasDoxxing ? 'elevated' : 'routine',
    heading: `Next steps for ${guide.label}`,
    summary: `Your Basirah report is saved. These steps help you preserve the evidence and send a separate report to ${guide.label}.`,
    steps,
    note: 'Reporting to Basirah does not report the content to the platform or police. Platform menus change, so use the closest hate, harassment, or threat option if the wording is different.',
  };
}

function placeStep(kind: string): ActionStep {
  switch (kind) {
    case 'mosque':
      return {
        title: 'Tell mosque leadership or security',
        detail:
          'Ask them to preserve camera footage, access logs, messages, and damage records before they are overwritten. Share the facts only with the people handling the response, and avoid posting identifying details publicly.',
      };
    case 'school':
      return {
        title: 'Make a written report to the school or campus',
        detail:
          'Report it to the principal, student-services office, campus security, or the school’s human-rights contact. Ask for a written incident number, the safety measures being taken, and preservation of camera footage or messages.',
      };
    case 'workplace':
      return {
        title: 'Put the workplace complaint in writing',
        detail:
          'Send a factual account to your manager, human-resources contact, union, or workplace safety representative. Keep copies outside the work system and ask what immediate safety and anti-retaliation measures will be used.',
      };
    case 'shop':
      return {
        title: 'Ask the business to record and preserve it',
        detail:
          'Ask a manager to create an incident report and preserve receipts, staff notes, and camera footage. Record the manager’s name and the reference number, especially if service was denied or staff were involved.',
      };
    case 'transit':
      return {
        title: 'Report it to the transit operator',
        detail:
          'Record the route, vehicle or car number, stop or station, direction, and exact time. Send those details to transit safety or customer service quickly so onboard or station video can be preserved.',
      };
    case 'home':
      return {
        title: 'Protect the home and preserve the scene',
        detail:
          'Photograph damage, messages, markings, or objects before cleaning or repairs when it is safe. Tell the property manager or landlord if shared access or building footage is involved, and ask that records be preserved.',
      };
    case 'street':
      return {
        title: 'Record the exact public location',
        detail:
          'Write down the nearest address or intersection, direction of travel, time, and any vehicle details. Ask witnesses for contact information only if it is safe, and note nearby businesses or cameras that may hold footage.',
      };
    default:
      return {
        title: 'Ask the place to preserve its records',
        detail:
          'If an organization controls the location, make a written incident report and ask it to preserve camera footage, access records, messages, and staff notes. Keep the name of the person who received the report.',
      };
  }
}

function inPersonPlan(
  category: string | null,
  details: Record<string, unknown>,
): IncidentActionPlan {
  const stillHappening = stringDetail(details, 'still_happening') === 'yes';
  const weapon = stringDetail(details, 'weapon') === 'yes';
  const threats = stringDetail(details, 'threats') === 'yes';
  const urgent = stillHappening && (weapon || threats);
  const elevated =
    urgent ||
    stillHappening ||
    weapon ||
    threats ||
    category === 'assault' ||
    category === 'threat';
  const kind = stringDetail(details, 'location_kind');
  const steps: ActionStep[] = [];

  if (urgent) {
    steps.push({
      title: 'Get to safety and call 911',
      detail:
        'If the incident is still happening, a weapon is involved, or anyone may be in immediate danger, move to a safer place if you can and call 911. Do not confront or follow the person.',
    });
  } else if (stillHappening) {
    steps.push({
      title: 'Move to a safer place and ask for immediate help',
      detail:
        'If you can, step away and contact staff, security, a trusted person, or another safe place nearby. Call 911 if the situation becomes dangerous or anyone may be harmed; otherwise, avoid confronting or following the person.',
    });
  }

  steps.push({
    title: 'Write down and preserve what happened',
    detail:
      'Record the time, exact place, words or actions, and what happened before and after. Keep original photos, video, messages, damaged property records, and witness contact information. Do not edit original files.',
  });

  steps.push(placeStep(kind));

  if (!urgent) {
    steps.push({
      title: 'Decide whether to make a police report',
      detail:
        'For assault, threats, vandalism, property damage, or repeated intimidation that is no longer in progress, contact your local police non-emergency line. Say that you believe the incident was motivated by anti-Muslim hate and ask for the occurrence or file number.',
    });
  }

  if (['school', 'workplace', 'shop', 'transit'].includes(kind)) {
    steps.push({
      title: 'Consider the human-rights complaint route',
      detail:
        'Discrimination by most schools, employers, shops, landlords, and local services is handled by the province or territory. Keep the internal complaint and response, then check the correct human-rights agency and its filing rules.',
      link: HUMAN_RIGHTS,
    });
  }

  steps.push({
    title: 'Find support without having to manage this alone',
    detail:
      'Justice Canada’s directory lists victim-service providers across Canada. They can help with safety planning, emotional support, information about reporting, and local referrals even when you are unsure about involving police.',
    link: VICTIM_SERVICES,
  });

  return {
    channel: 'in_person',
    urgency: urgent ? 'urgent' : elevated ? 'elevated' : 'routine',
    heading: urgent ? 'Safety comes first' : 'Your practical next steps',
    summary: urgent
      ? 'Your answers indicate a possible immediate safety concern. Use the first step now if the danger is current.'
      : 'Your Basirah report is saved. These steps help preserve evidence and choose the right local response.',
    steps: steps.slice(0, 6),
    note: 'Basirah does not automatically contact police, the location, a human-rights body, or another organization. You decide which separate reports or support options are right for you.',
  };
}

export function buildActionPlan(input: {
  channel: string;
  category?: string | null;
  details?: Record<string, unknown> | null;
}): IncidentActionPlan {
  const details = input.details ?? {};
  return input.channel === 'online'
    ? onlinePlan(details)
    : inPersonPlan(input.category ?? null, details);
}
