import { type ComponentType, useCallback, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'iconsax-react'
import gsap from 'gsap'
import MeshGradient from '../../components/MeshGradient/MeshGradient'
import { ONBOARDING_GRADIENTS } from './gradients'
import Progress from './Progress'
import StepWelcome from './steps/StepWelcome'
import StepRole from './steps/StepRole'
import StepDetails from './steps/StepDetails'
import StepPlan from './steps/StepPlan'
import StepTools from './steps/StepTools'
import SplashScreen from './SplashScreen'
import { EMPTY_ONBOARDING, type OnboardingData, type StepProps } from './types'
import './Onboarding.css'

interface StepDef {
  title: string
  subtitle: string
  primaryLabel: string
  Body: ComponentType<StepProps>
  /** Whether the primary button is enabled. Defaults to always enabled. */
  isValid?: (data: OnboardingData) => boolean
  /** Pin the footer and scroll the fields area when the content is tall
   *  (used for the long chip lists). Only safe on steps without overlays
   *  (dropdowns / listboxes), which need overflow-visible to escape. */
  scrollable?: boolean
}

const STEPS: StepDef[] = [
  {
    title: 'Let’s get started!',
    subtitle:
      "Before your upskilling journey begins we need to know a bit about you!\nWe'll use this to show you content we know you'll love!",
    primaryLabel: 'Continue',
    Body: StepWelcome,
    isValid: (d) => d.firstName.trim() !== '' && d.lastName.trim() !== '',
  },
  {
    title: 'Your role',
    subtitle: "Tell us about your role and we'll show the lessons most relevant to you",
    primaryLabel: 'Continue',
    Body: StepRole,
    isValid: (d) => d.role.trim() !== '' && d.experience !== '',
  },
  {
    title: 'Just a few more details',
    subtitle: 'These help us send you the right learning from day one',
    primaryLabel: 'Continue',
    Body: StepDetails,
    isValid: (d) => d.region !== '' && d.department !== '' && d.office !== '',
  },
  {
    title: 'Your Personalised Upskilling Plan',
    subtitle:
      "We've researched hundreds of roles and skill maps to handpick the hard and soft skills you need to succeed in your role.",
    primaryLabel: 'Continue',
    Body: StepPlan,
  },
  {
    title: 'Tools & Life Skills',
    subtitle:
      "Tell us the tools you use, and we'll help you get more efficient with them. Let us know your interests and the life skills you want to improve, and we'll recommend relevant lessons.",
    primaryLabel: 'Start Learning',
    Body: StepTools,
    isValid: (d) => d.tools.length > 0 && d.lifeSkills.length > 0,
    scrollable: true,
  },
]

const reducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  // Gradient index updates the instant Continue/Back is clicked, so the
  // background starts morphing in sync with the click — ahead of the content
  // swap, which waits for the form to slide out.
  const [gradientIndex, setGradientIndex] = useState(0)
  const [data, setData] = useState<OnboardingData>(EMPTY_ONBOARDING)
  // Once the final step is confirmed we swap the form for the loading splash,
  // which plays the Hugo animation before navigating to the Workspace.
  const [finishing, setFinishing] = useState(false)

  const formRef = useRef<HTMLDivElement>(null)
  const dirRef = useRef(1) // 1 = forward, -1 = back
  const animatingRef = useRef(false)

  const update = useCallback(
    (patch: Partial<OnboardingData>) => setData((d) => ({ ...d, ...patch })),
    [],
  )

  // Slide the form content in whenever the step changes (and on first mount).
  useLayoutEffect(() => {
    const form = formRef.current
    if (!form) return
    if (reducedMotion()) {
      gsap.set(form, { clearProps: 'all' })
      animatingRef.current = false
      return
    }
    const dir = dirRef.current
    const header = form.querySelector('.onboarding__header')
    const rest = form.querySelectorAll('.onboarding__field, .onboarding__footer')
    const ctx = gsap.context(() => {
      gsap.set(form, { autoAlpha: 1 })
      gsap.fromTo(form, { y: 48 * dir }, { y: 0, duration: 0.45, ease: 'power3.out' })
      // Header leads in first…
      gsap.fromTo(
        header,
        { y: 18, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.4, ease: 'power3.out', delay: 0.05, clearProps: 'transform' },
      )
      // …then the inputs (and footer) follow after a small beat.
      // clearProps removes the leftover transform so fields don't become
      // stacking contexts that would trap an open dropdown/listbox behind a
      // later sibling.
      gsap.fromTo(
        rest,
        { y: 18, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.4,
          stagger: 0.07,
          ease: 'power3.out',
          delay: 0.3,
          clearProps: 'transform',
          onComplete: () => {
            animatingRef.current = false
          },
        },
      )
    }, form)
    return () => ctx.revert()
  }, [step])

  const go = useCallback(
    (target: number, dir: 1 | -1) => {
      if (animatingRef.current || target < 0) return
      if (target >= STEPS.length) {
        setFinishing(true) // show the loading splash; it navigates when done
        return
      }
      dirRef.current = dir
      setGradientIndex(target) // start the background morph immediately on click
      if (reducedMotion()) {
        setStep(target)
        return
      }
      animatingRef.current = true
      gsap.to(formRef.current, {
        y: -48 * dir,
        autoAlpha: 0,
        duration: 0.26,
        ease: 'power2.in',
        onComplete: () => setStep(target),
      })
    },
    [navigate],
  )

  const current = STEPS[step]
  const Body = current.Body
  const canContinue = current.isValid ? current.isValid(data) : true

  return (
    <div className={`onboarding${current.scrollable ? ' onboarding--scroll' : ''}`}>
      <MeshGradient config={ONBOARDING_GRADIENTS[gradientIndex]} morphDuration={2.2} />

      {finishing && <SplashScreen onDone={() => navigate('/workspace')} />}

      <div className="onboarding__panel">
        <div className="onboarding__column">
          <header className="onboarding__topbar">
            <Logo />
            <Progress current={step + 1} total={STEPS.length} />
          </header>

          <div className="onboarding__form" ref={formRef}>
            <div className="onboarding__header">
              <h1 className="onboarding__title">{current.title}</h1>
              <p className="onboarding__subtitle">{current.subtitle}</p>
            </div>

            <div className="onboarding__fields">
              <Body data={data} update={update} />
            </div>

            <div className="onboarding__footer">
              {step > 0 ? (
                <button
                  type="button"
                  className="onboarding__back"
                  onClick={() => go(step - 1, -1)}
                  aria-label="Go back"
                >
                  <ArrowLeft size={18} color="currentColor" />
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                className="onboarding__primary"
                onClick={() => go(step + 1, 1)}
                disabled={!canContinue}
              >
                {current.primaryLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** 5Mins.ai wordmark, tinted for the dark onboarding panel. */
function Logo() {
  return (
    <svg width="94" height="20" viewBox="0 0 103 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="5Mins.ai">
      <g clipPath="url(#ob_logo)">
        <path d="M0 15.5275H4.14665C4.18738 16.5133 4.51324 17.275 5.12424 17.8045C5.65378 18.2974 6.40327 18.5418 7.38087 18.5418C8.55806 18.5418 9.45419 18.2159 10.0652 17.5561C10.6762 16.8188 10.9817 15.8127 10.9817 14.5377C10.9817 13.2628 10.6558 12.3626 10.0082 11.7068C9.39716 11.0102 8.5214 10.6599 7.38494 10.6599C6.77394 10.6599 6.22404 10.7821 5.73932 11.0306C5.20978 11.3198 4.82282 11.6864 4.58249 12.1385L0.680245 11.9552L2.07332 0.439941H12.3177C12.888 0.480675 13.3849 0.708781 13.8126 1.11611C14.2403 1.52752 14.4522 2.04076 14.4522 2.65583V4.13445H5.12424L4.57434 8.26073C4.94094 7.93079 5.4664 7.66602 6.15887 7.45828C6.8106 7.25462 7.49899 7.14871 8.23219 7.14871C10.387 7.14871 12.1141 7.80451 13.4175 9.1202C14.7577 10.4766 15.4298 12.22 15.4298 14.3544C15.4298 16.6966 14.6966 18.5622 13.2342 19.9593C11.8126 21.3157 9.85745 21.9919 7.38087 21.9919C5.06314 21.9919 3.27495 21.4379 2.01222 20.33C0.749492 19.1813 0.0814665 17.5805 0 15.5275Z" fill="#00CEE6"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M16.7535 21.5561V2.70471C16.7535 2.09371 16.9694 1.57233 17.3971 1.14463C17.8248 0.716928 18.3462 0.480675 18.9572 0.439941H23.1772L27.336 16.5377L31.4949 0.439941H37.9185V21.5561H33.8819V4.54178L29.6008 21.5561H25.1364L20.7943 4.54178V21.5561H16.7576H16.7535Z" fill="#F9F9FA"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M39.6782 7.47852H41.9471C42.5336 7.47852 43.0387 7.65367 43.4583 8.00805C43.8778 8.36243 44.0856 8.78605 44.0856 9.27893V21.5559H39.6782V7.47852Z" fill="#F9F9FA"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M59.5195 21.556H57.3891C56.7822 21.556 56.2852 21.3605 55.8983 20.9736C55.5113 20.5866 55.3199 20.0815 55.3199 19.4664V11.108C55.3199 10.1263 55.0266 9.40938 54.436 8.95724C53.8494 8.5051 53.1895 8.28107 52.4604 8.28107C51.7313 8.28107 51.0795 8.5051 50.5133 8.95724C49.9472 9.40938 49.662 10.1263 49.662 11.108V21.556H45.4054V11.9674C45.4054 9.18128 46.1223 7.31977 47.5643 6.37475C49.0021 5.43382 50.5948 4.92058 52.3382 4.83911C54.1223 4.83911 55.7639 5.31162 57.2628 6.25256C58.7618 7.19757 59.5113 9.09981 59.5113 11.9674V21.556H59.5195Z" fill="#F9F9FA"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M60.3993 16.2363H64.5907C64.6315 17.0632 64.937 17.6823 65.5154 18.0937C66.1305 18.5051 66.9533 18.7129 67.9798 18.7129C68.7211 18.7129 69.3565 18.5703 69.8901 18.2811C70.383 17.9919 70.6315 17.6008 70.6315 17.1039C70.6315 16.3625 69.7679 15.8045 68.0408 15.4298C67.2995 15.3076 66.7455 15.1813 66.3749 15.0591C64.1956 14.5214 62.7374 13.8819 61.996 13.1405C61.1732 12.3992 60.7618 11.4053 60.7618 10.167C60.7618 8.59879 61.3565 7.2994 62.55 6.26478C63.7842 5.31569 65.385 4.83911 67.3606 4.83911C69.495 4.83911 71.2017 5.31569 72.4767 6.26478C73.6702 7.2994 74.3056 8.63952 74.3871 10.2892H71.7354C70.9533 10.2892 70.3586 9.93892 69.9472 9.23423C69.7842 9.0713 69.6172 8.90429 69.4543 8.73728C68.9614 8.36661 68.2812 8.17924 67.4217 8.17924C66.5622 8.17924 65.9838 8.30144 65.5724 8.54991C65.2017 8.79838 65.0184 9.16906 65.0184 9.666C65.0184 10.3259 66.0857 10.8839 68.2242 11.3361C68.4726 11.4175 68.6885 11.4827 68.8718 11.5234C69.0551 11.5642 69.2303 11.5845 69.3973 11.5845C71.495 12.1222 72.9533 12.7414 73.7761 13.442C74.5541 14.1833 74.9492 15.1772 74.9492 16.4155C74.9492 18.2322 74.2893 19.6375 72.9777 20.6273C71.7435 21.5357 69.8942 21.9919 67.4299 21.9919C64.9655 21.9919 63.3402 21.5194 62.1916 20.5662C60.9981 19.6171 60.4034 18.2322 60.4034 16.4155V16.2281L60.3993 16.2363Z" fill="#F9F9FA"/>
        <path d="M44.6477 3.54777C45.0795 3.29115 45.0795 2.86752 44.6477 2.6109L40.4603 0.109881C40.0285 -0.146739 39.6782 0.0650743 39.6782 0.578313V5.58036C39.6782 6.0936 40.0285 6.30541 40.4603 6.04879L44.6477 3.54777Z" fill="#FFBB38"/>
        <path d="M80.3097 18.3667V21.6539H76.77V19.5887C76.77 18.774 77.2099 18.3667 78.1183 18.3667H80.3097Z" fill="#F9F9FA"/>
        <path d="M86.7903 9.40938H82.6274C83.1284 6.34217 85.2873 4.83911 89.1081 4.83911C93.6783 4.83911 95.9961 6.34217 96.0897 9.40938V15.0469C96.0897 19.6171 93.3362 21.6538 88.8555 21.9674C84.88 22.2811 82.1223 20.4318 82.1223 16.7699C82.216 12.7943 85.0958 11.7271 89.2914 11.3198C91.0755 11.0998 91.9838 10.5662 91.9838 9.66193C91.8902 8.72099 91.0144 8.25256 89.2914 8.25256C87.8209 8.25256 87.0062 8.6273 86.7863 9.40938H86.7903ZM92.049 14.8595V13.3238C91.0796 13.7312 89.9512 14.0733 88.7292 14.3259C87.0714 14.6395 86.2242 15.4216 86.2242 16.6436C86.3178 17.9593 87.0062 18.5866 88.3219 18.5866C90.6396 18.5866 92.049 17.2098 92.049 14.8595Z" fill="#F9F9FA"/>
        <path d="M93.2384 8.65178C94.5867 8.65178 96.0897 10.8432 96.0897 12.1874V21.6538H92.3341V18.1671L93.4706 12.5296L93.2425 8.64771L93.2384 8.65178Z" fill="#F9F9FA"/>
        <path d="M100.257 0.362549C101.634 0.362549 102.293 1.05094 102.261 2.39921V3.62121H98.0979V0.362549H100.257ZM100.257 5.09168C101.605 5.09168 102.261 5.74749 102.261 7.09576V21.6579H98.0979V5.09168H100.257Z" fill="#F9F9FA"/>
      </g>
      <defs>
        <clipPath id="ob_logo"><rect width="102.261" height="22" fill="white"/></clipPath>
      </defs>
    </svg>
  )
}
