import { type FC } from "react";
import type { TabName, Tab } from "../../types";

interface HeroProps {
  activeTab: TabName;
  setActiveTab: (tab: TabName) => void;
  tabs: Tab[];
}

const Hero: FC<HeroProps> = ({ activeTab, setActiveTab, tabs }) => {
  return (
    <div className="flex justify-center w-full bg-base-200 overflow-hidden text-base-content transition-all duration-500 ease-in-out text-center relative min-h-[300px]">
      <div className="w-full max-w-3xl mx-auto px-4 py-8 flex flex-col items-center gap-8">
        <div className="relative w-full">
          <h1 className="w-full text-center text-[clamp(1rem,7vw,3rem)] whitespace-nowrap font-bold">
            Learn Japanese Numerals
          </h1>
        </div>

        <div className="w-full flex flex-col items-center gap-8 transition-all duration-500 ease-in-out overflow-hidden max-h-[500px] opacity-100">
          <p className="text-xl font-light max-w-[80%] mx-auto">
            Learn to read, write, and understand Japanese numbers.
          </p>
          <div className="join flex justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                className={`join-item btn md:btn-md lg:btn-lg xl:btn-xl transition-all duration-200 ${
                  activeTab === tab.name
                    ? "btn-accent text-accent-content font-bold"
                    : "btn-primary opacity-80"
                }`}
                onClick={() => setActiveTab(tab.name)}
                aria-pressed={activeTab === tab.name}
              >
                {tab.name}
              </button>
            ))}
          </div>
          <div className="flex justify-center gap-4">
            <object
              className=""
              data="https://img.shields.io/npm/v/num2kana?registry_uri=https%3A%2F%2Fregistry.npmjs.com&style=for-the-badge&logo=npm&label=num2kana&color=primary&link=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fnum2kana"
              type="image/svg+xml"
              aria-label="NPM Version"
            />
            <object
              data="https://img.shields.io/github/license/mammamu4/num2kana?style=for-the-badge&link=https%3A%2F%2Fgithub.com%2FMammamu4%2Fnum2kana-website%2Fblob%2Fmain%2FLICENSE"
              type="image/svg+xml"
              aria-label="License"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
