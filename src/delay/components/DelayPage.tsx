import { useState, useEffect, useCallback, useRef } from "preact/hooks";
import type { BlockInfo, EmotionCategory } from "../../shared/types";
import { sendMessage } from "../../shared/messaging";
import { Countdown } from "./Countdown";
import { EmotionPicker } from "./EmotionPicker";
import { IntensitySlider } from "./IntensitySlider";
import { NoteInput } from "./NoteInput";

export function DelayPage() {
  const [blockInfo, setBlockInfo] = useState<BlockInfo | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [cancelled, setCancelled] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Emotion tracking state
  const [emotionCategory, setEmotionCategory] = useState<EmotionCategory>("boredom");
  const [emotionFlavor, setEmotionFlavor] = useState<string | undefined>();
  const [intensity, setIntensity] = useState(5);
  const [note, setNote] = useState("");
  const [waitingForNote, setWaitingForNote] = useState(false);

  const intervalRef = useRef<number | null>(null);
  const noteFocusedRef = useRef(false);

  // Parse tabId from URL
  const tabId = new URLSearchParams(window.location.search).get("tabId");

  useEffect(() => {
    if (!tabId) {
      setError("Missing tab information.");
      return;
    }

    sendMessage({ type: "getBlockInfo", tabId: Number(tabId) }).then((info) => {
      if (!info) {
        setError("No block info found for this tab.");
        return;
      }
      setBlockInfo(info);
      setRemaining(info.delaySecs);
    });
  }, [tabId]);

  // Countdown timer
  useEffect(() => {
    if (!blockInfo || remaining <= 0 || cancelled) return;

    intervalRef.current = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [blockInfo, cancelled]);

  // Blur cancellation — only while countdown is still running
  useEffect(() => {
    if (!blockInfo?.delayCancel || cancelled || remaining === 0) return;

    function onBlur() {
      setCancelled(true);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, [blockInfo, cancelled, remaining]);

  const handleComplete = useCallback(async () => {
    if (!blockInfo || !tabId || completed) return;
    setCompleted(true);

    try {
      await sendMessage({
        type: "delayComplete",
        tabId: Number(tabId),
        entry: {
          blockedURL: blockInfo.blockedURL,
          blockedHost: blockInfo.blockedHost,
          emotionCategory,
          emotionFlavor,
          intensity,
          note: note.trim() || undefined,
          completed: true,
        },
      });
    } catch (err) {
      console.error("[Urge Guard] delayComplete failed:", err);
    }

    // Navigate client-side — the background has set allowedHost so the
    // navigation won't be blocked.  This also covers the case where
    // delayAutoLoad is disabled or the background redirect didn't fire.
    window.location.href = blockInfo.blockedURL;
  }, [blockInfo, tabId, emotionCategory, emotionFlavor, intensity, note, completed]);

  // Auto-complete when countdown reaches 0 (defer if user is typing a note)
  useEffect(() => {
    if (remaining === 0 && blockInfo && !completed && !waitingForNote) {
      if (noteFocusedRef.current) {
        setWaitingForNote(true);
      } else {
        handleComplete();
      }
    }
  }, [remaining, blockInfo, completed, waitingForNote, handleComplete]);

  if (error) {
    return (
      <main class="container">
        <article style={{ textAlign: "center", marginTop: "2rem" }}>
          <p>{error}</p>
        </article>
      </main>
    );
  }

  if (!blockInfo) {
    return (
      <main class="container">
        <article style={{ textAlign: "center", marginTop: "2rem" }}>
          <p aria-busy="true">Loading...</p>
        </article>
      </main>
    );
  }

  return (
    <main class="container" style={{ maxWidth: "540px", paddingTop: "2rem" }}>
      <article style={{ textAlign: "center" }}>
        <header>
          <h2 style={{ marginBottom: "0.25rem" }}>Take a breath</h2>
          <p>
            <small style={{ color: "var(--pico-muted-color)" }}>
              {blockInfo.blockedHost}
            </small>
          </p>
        </header>

        <Countdown
          total={blockInfo.delaySecs}
          remaining={remaining}
          cancelled={cancelled}
        />

        {cancelled ? (
          <p style={{ color: "var(--pico-del-color)", marginTop: "1rem" }}>
            <s>Countdown cancelled — you switched away.</s>
          </p>
        ) : (
          <button
            disabled={remaining > 0}
            onClick={handleComplete}
            style={{ width: "100%", marginTop: "1rem" }}
          >
            {completed
              ? "Redirecting..."
              : remaining > 0
                ? `Redirecting in ${remaining}s...`
                : `Continue to ${blockInfo.blockedHost}`}
          </button>
        )}
      </article>

      {(!completed || waitingForNote) && !cancelled && (
        <article>
          <header>
            <h3>What are you feeling?</h3>
          </header>

          <EmotionPicker
            selected={emotionCategory}
            selectedFlavor={emotionFlavor}
            onSelect={setEmotionCategory}
            onSelectFlavor={setEmotionFlavor}
          />

          <IntensitySlider value={intensity} onChange={setIntensity} />

          <NoteInput
            value={note}
            onChange={setNote}
            onFocusChange={(focused) => { noteFocusedRef.current = focused; }}
          />
        </article>
      )}
    </main>
  );
}
