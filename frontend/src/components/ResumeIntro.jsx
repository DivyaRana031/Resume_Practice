import {
  FileText,
  Mic2,
  BarChart3,
  ArrowUpRight,
} from "lucide-react";

const benefits = [
  {
    icon: FileText,
    label: (
      <>
        Resume Based
        <br />
        Topics
      </>
    ),
    iconClass: "bg-[#EEF0FF] text-[#4D62C9]",
  },
  {
    icon: Mic2,
    label: (
      <>
        Practice Speaking
        <br />
        with AI
      </>
    ),
    iconClass: "bg-[#FFF2DF] text-[#F19A43]",
  },
  {
    icon: BarChart3,
    label: (
      <>
        Improve
        <br />
        Confidently
      </>
    ),
    iconClass: "bg-[#FFE8E5] text-[#E86D61]",
  },
];

const ResumeIntro = () => {
  return (
    <section className="relative flex h-full w-full items-center">
      <div className="relative w-full max-w-[610px] pl-1">

        {/* Heading */}
        <h1
          className="
            font-['Plus_Jakarta_Sans']
            text-[clamp(48px,4.2vw,68px)]
            font-bold
            leading-[0.98]
            tracking-[-3px]
            text-[#17211F]
          "
        >
          Turn Your
          <br />
          Resume into
          <br />

          <span className="relative inline-block text-[#176B5B]">
            Real Conversations.

            {/* subtle hand-drawn underline */}
            <span
              className="
                absolute
                -bottom-1
                left-1
                right-2
                -z-10
                h-[6px]
                rotate-[-1deg]
                rounded-[50%]
                bg-[#F6C85F]
                opacity-60
              "
            />
          </span>
        </h1>

        {/* Description */}
        <p
          className="
            mt-7
            max-w-[500px]
            font-['Inter']
            text-[17px]
            font-normal
            leading-[1.55]
            text-[#68736F]
          "
        >
          Upload your resume and get personalized
          <br />
          speaking topics to practice, with AI.
        </p>

        {/* Benefits */}
        <div className="mt-8 flex items-start gap-10">
          {benefits.map(
            ({ icon: Icon, label, iconClass }) => (
              <div
                key={iconClass}
                className="flex min-w-[105px] flex-col items-start gap-2.5"
              >
                {/* Icon */}
                <div
                  className={`
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-[15px]
                    ${iconClass}
                  `}
                >
                  <Icon
                    size={23}
                    strokeWidth={2}
                  />
                </div>

                {/* Label */}
                <span
                  className="
                    font-['Inter']
                    text-[13px]
                    font-semibold
                    leading-[1.45]
                    text-[#17211F]
                  "
                >
                  {label}
                </span>
              </div>
            )
          )}
        </div>

        {/* Small decorative note */}
        <div
          className="
            absolute
            -bottom-[145px]
            -left-5
            flex
            rotate-[-3deg]
            items-end
            gap-3
            text-[#176B5B]
          "
        >
          <span
            className="
              font-['Comic_Sans_MS']
              text-[17px]
              font-semibold
              leading-[1.15]
              tracking-[0.3px]
            "
          >
            Small
            <br />
            Steps,
            <br />
            Big Progress.
          </span>

          <ArrowUpRight
            size={30}
            strokeWidth={1.7}
            className="mb-0.5 rotate-[12deg]"
          />
        </div>

      </div>
    </section>
  );
};

export default ResumeIntro;