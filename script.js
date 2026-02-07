import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";

document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(CustomEase, SplitText);

    CustomEase.create("hop", ".8,0,.3,1");

    const splitTextElement = (selector, type = "words,chars",
        addFirstChar = false) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
            const splitText = new SplitText(element, {
                type,
                wordsClass: "word",
                charsClass: "char"
            });

            if (type.includes("chars")) {
                splitText.chars.forEach((char, index) => {
                    const originalText = char.textContent;
                    char.innerHTML = `<span>${originalText}</span>`;

                    if (addFirstChar && index === 0) {
                        char.classList.add("first-char");
                    } // 补全: if 结束
                }); // 补全: chars.forEach 结束


            } // 补全: if(type.includes) 结束
        }); // 补全: elements.forEach 结束
    }; // 补全: const splitTextElement 函数定义结束


    splitTextElement(".intro-title h1", "words, chars", true);
    splitTextElement(".outro-title h1");
    splitTextElement(".tag p", "words");
    splitTextElement(".card h1", "words, chars", true);

    const isMobile = window.innerWidth <= 1000;

    const t1 = gsap.timeline({ defaults: { ease: "hop" } });
    const tags = gsap.utils.toArray(".tag");

    tags.forEach((tag, index) => {
        t1.to(tag.querySelectorAll("p .word"), {
            y: "0%",
            duration: 0.6,
        },
            0.5 + index * 0.1
        );
    });

    t1.to(
        [".preloader .intro-title .char span", ".split-overlay .intro-title .char span"],
        {
            y: "0%",
            duration: 0.75,
            // stagger removed
        },
        0.5
    ).to(".preloader .outro-title .char:not(.first-char) span", {
        y: "100%",
        duration: 0.75,
        stagger: 0.05,
    },
        2
    )
        .to(
            ".preloader .intro-title .char span",
            {
                y: "0%",
                duration: 0.75,
                stagger: 0.075,
            },
            2.5

        ).to(
            ".preloader .intro-title .char span",
            {
                y: "0%",
                duration: 0.75,
                // stagger removed for "one block" appearance
            },
            2.5
        )
        // New YANG Animation Logic
        .to(
            [".preloader .intro-title .char", ".preloader .outro-title .char"],
            {
                opacity: (i, target) => {
                    // Indices for B(0) Y(1) Z(2) A(3) N(4) T(5) I(6) U(7) M(8) G(9) E(10) N(11) E(12)
                    // Target Indices: 1 (Y), 3 (A), 4 (N), 9 (G)
                    // Note: We need to check the text content to be safe, or stick to indices if confident.
                    // The querySelectorAll returns all chars.
                    // "BYZANTIUM GENE" -> 13 chars.
                    // Let's rely on indices for "BYZANTIUM GENE".
                    // We need to match indices 1, 3, 4, 9.
                    // IMPORTANT: The selection above targets ALL chars including outro-title (10).
                    // We need to be specific about which set of chars checks which logic.
                    // But actually, we can just use a separate tween for fading out non-targets.
                    return 1; // overridden below
                },
                // We'll separate the fade logic to be cleaner
            },
            3.5
        )
        // Fade out non-target chars
        .to(
            ".preloader .intro-title .char",
            {
                opacity: (i) => {
                    // Keep indices 1, 3, 4, 9
                    return [1, 3, 4, 9].includes(i) ? 1 : 0;
                },
                duration: 0.5
            },
            3.5
        )
        // Reset the 'first-char' specific props if inherited
        // Move Target Chars to Center
        .to(
            ".preloader .intro-title .char", // We need to target specific ones
            {
                x: (i) => {
                    if (![1, 3, 4, 9].includes(i)) return 0;

                    const isMobile = window.innerWidth <= 1000;

                    // Goal: Center YANG.
                    // Y(1), A(3), N(4) are Left of center -> Move RIGHT (+).
                    // G(9) is Right of center -> Move LEFT (-).

                    if (i === 1) return isMobile ? "6rem" : "10rem";   // Y: Move Right significantly
                    if (i === 3) return isMobile ? "3.5rem" : "8rem";  // A: Move Right
                    if (i === 4) return isMobile ? "1rem" : "10.5rem";   // N: Move Right slightly
                    if (i === 9) return isMobile ? "-1.5rem" : "-4rem";  // G: Move Left slightly
                    return 0;
                },
                y: (i) => {
                    // Move them to vertical center? They are already there (y:0).
                    // However, the previous "B" logic moved B to specific x/y.
                    // We keep y:0 for now.
                    return "0%";
                },
                scale: 1.5, // Emphasize them?
                duration: 1,
                ease: "power2.inOut"
            },
            3.5
        )
        .to(
            ".preloader .outro-title", // Hide the entire container to be safe
            {
                opacity: 0,
                duration: 0.1 // Instant or fast
            },
            3.5
        )
        // Also hide the outro title "10" for now? Or keep it?
        // User didn't specify, but "YANG" needs to split.
        // The split animation logic (at 4.5s) moves .intro-title .char.
        // We need to ensure that move applies to OUR new YANG.

        .to(
            ".split-overlay .intro-title .char",
            {
                opacity: (i) => [1, 3, 4, 9].includes(i) ? 1 : 0,
                x: (i) => {
                    const isMobile = window.innerWidth <= 1000;
                    if (i === 1) return isMobile ? "6rem" : "10rem";
                    if (i === 3) return isMobile ? "3.5rem" : "8rem";
                    if (i === 4) return isMobile ? "1rem" : "10.5rem";
                    if (i === 9) return isMobile ? "-1.5rem" : "-4rem";
                    return 0;
                },
                scale: 1.5,
                duration: 1,
                ease: "power2.inOut"
            },
            3.5
        )

        // Final Resolve (Scale down or disappear?)
        // The original logic had the "B" (first char) scale down and move to final position.
        // Now "YANG" is the hero.
        // User said: "split, move up and down".
        // This is handled by the container clipPath / movement later.

        // We just need to ensure they stay visible during the split.
        // And maybe hide them at the very end when the card reveals.

        .to(
            ".preloader .intro-title .char",
            {
                // Maintain positions until split completes
                duration: 0.1
            },
            4.5
        )
        .call(() => {
            // Ensure clip paths are set for split
            gsap.set(".preloader", {
                clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 50%)",
            });
            gsap.set(".split-overlay", {
                clipPath: "polygon(0 50%, 100% 50%, 100% 100%, 0 100%)",
            });
        }, null, 4.5)



        .to(
            ".container",
            {
                clipPath: "polygon(0 48%, 100% 48%, 100% 52%, 0 52%)",
                duration: 1,
            },
            5
        );
    tags.forEach((tag, index) => {
        t1.to(
            tag.querySelectorAll("p .word"), {
            y: "100%",
            duration: 0.75,
        },
            5.5 + index * 0.1
        );


    });
    t1.to(
        [".preloader", ".split-overlay"],
        {
            y: (i) => (i === 0 ? "-50%" : "50%"),
            duration: 1,
        },
        6
    ).to(
        ".container",
        {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            duration: 1,
        },
        6
    ).to((".container .card"),
        {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            duration: 1,

        },
        6.25
    )
        .to(
            ".container .card h1 .char span",
            {
                y: "0%",
                duration: 0.75,
                stagger: 0.05,
            },
            6.5

        )


}); // 补全: DOMContentLoaded 事件监听结束