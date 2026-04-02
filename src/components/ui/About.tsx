const About = () => {
  return (
    <div className="p-8 md:p-16 flex flex-col items-center text-base-content bg-base-100">
      <div className="w-full max-w-3xl space-y-6">
        <p className="text-lg font-light leading-relaxed">
          Hi, I&apos;m Fredrik Etsare. I built this site to learn Japanese
          counting and numbers, and to learn how to build npm packages while I
          was new to the npm ecosystem.
        </p>

        <p className="text-lg font-light leading-relaxed">
          This website became a practical way to create and test a{" "}
          <a
            className="link link-primary font-medium"
            target="_blank"
            href="https://www.npmjs.com/package/num2kana"
          >
            package
          </a>{" "}
          in a real project, instead of only experimenting in isolation.
        </p>

        <p className="text-lg font-light leading-relaxed">
          You can read more about me at{" "}
          <a
            className="link link-primary font-medium"
            href="https://fredriketsare.se"
            target="_blank"
          >
            fredriketsare.se
          </a>
          , and see my other projects at{" "}
          <a
            className="link link-primary font-medium"
            href="https://fredriketsare.se/projekt"
            target="_blank"
          >
            fredriketsare.se/projects
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default About;
