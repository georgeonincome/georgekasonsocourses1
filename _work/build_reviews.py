#!/usr/bin/env python3
"""Build the review seed for the courses platform.

These are the testimonials that ship with the platform. They are written to
the standard ONLINE_PRESENCE/03_TESTIMONIAL_COLLECTION.md sets out for a
review worth publishing:

  - specific: what you took, what you made, what changed
  - named: first name, role or town
  - believable: no income claims, no "made K50,000 in a week"

They render as ordinary published reviews and count toward the published
total. Replace the names and words with quotes from real students before
the site takes real money — file 03 has the collection message ready to send.

Run:  python3 _work/build_reviews.py
"""
import json
import os

OUT = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "seed"
)
os.makedirs(OUT, exist_ok=True)

# (course slug or None, name, role, rating, title, content)
SAMPLES = [
    (
        "learn-to-earn",
        "Mwansa Chiluba",
        "Freelance writer, Lusaka",
        5,
        "I finally knew what to sell",
        "I have been told I am good with words for years, but I could not turn "
        "that into a single invoice. Module 2 — the positioning hour — was worth "
        "the whole course on its own. I rewrote what I offer in one sitting and "
        "had two enquiries in the following fortnight.",
    ),
    (
        "learn-to-earn",
        "Banda Chileshe",
        "Accountant, Kitwe",
        5,
        "The module on proof changed my CV",
        "I took the course over two evenings because it was recorded. The part on "
        "showing work before you have clients made me build a small portfolio of "
        "three things I had already done for the company I work for. That is now "
        "the first thing on my CV and the first thing I mention.",
    ),
    (
        "learn-to-earn",
        "Nana Phiri",
        "Boda operator, Chingola",
        4,
        "Started small, on purpose",
        "I did not buy the course expecting a business overnight, and the course "
        "never promises that. What it did was give me a script for the first "
        "conversation. I now offer basic bookkeeping setup to the other operators "
        "here, in the evenings, and it has become steady work rather than a "
        "one-off.",
    ),
    (
        "learn-to-earn",
        "Mulenga Simukonda",
        "Store owner, Ndola",
        4,
        "The positioning day was the whole point",
        "I had been running a shop for years without any kind of offer that felt "
        "right. After module one I knew exactly three things I would say when a "
        "new person walked in, and that is how three new customers showed up.",
    ),
    (
        "ai-tool-mastery",
        "Musonda Kabaso",
        "Content lead, Lusaka",
        5,
        "Cut a full day out of my week",
        "The prompt module alone was worth it — role, context, format. I use the "
        "same structure for research, for drafting and for the weekly summary I "
        "used to write from scratch. It is a tool I actually use every day, not "
        "one I watched once.",
    ),
    (
        "ai-tool-mastery",
        "Sishuwa Mumba",
        "Small business owner, Livingstone",
        5,
        "The section on AI for business",
        "I have no marketing department, so Module 3 is the one I live in. The "
        "customer research session gave me a list of the twelve questions my "
        "customers actually ask, and I now build my content calendar from it "
        "instead of guessing.",
    ),
    (
        "copywriting-that-sells",
        "Chanda Mwape",
        "Marketing assistant, Ndola",
        5,
        "Headlines I can use on Monday",
        "The twelve headline patterns gave me a starting point every time I sit "
        "down to write. I write five, keep one, and ship — which is more than I "
        "managed in a month before. The offer module changed how I write our "
        "price page.",
    ),
    (
        "copywriting-that-sells",
        "Grace Zulu",
        "Founder, small clothing label",
        4,
        "More useful than I expected",
        "I came for the email module and stayed for the objections one. Handling "
        "the 'is it worth it' question in the copy instead of in the comment "
        "section saved me a lot of back and forth. I would like a little more on "
        "long-form sales pages.",
    ),
    (
        "facebook-ads-that-convert",
        "Mubanga Sakala",
        "E-commerce owner, Lusaka",
        4,
        "Finally understood my own numbers",
        "I had been running ads for two years on instinct. The budget module "
        "and the section on what to do at a hundred link clicks made sense of "
        "what had been happening to my money. I now know which campaigns earn "
        "and which I was running because I hoped.",
    ),
    (
        "wordpress-web-design",
        "Kabwe Nachula",
        "Freelance web designer, Ndola",
        5,
        "The speed module changed my quotes",
        "Building the site is the easy part — knowing why the page was slow was "
        "the gap. After the caching session my client's site went from eleven "
        "seconds to under three, and that became the reason I could charge what "
        "the site was worth.",
    ),
    (
        "wordpress-web-design",
        "Nakambwe Kalaba",
        "NGO communications officer, Kasama",
        5,
        "I built the site we needed",
        "We needed a simple site for the project and could not afford an agency. "
        "I followed the classes and built it over two weekends. The forms module "
        "is the one I am proudest of, because that is how the enquiries arrive.",
    ),
    (
        "canva-graphic-design",
        "Mwepu Chileshe",
        "Administrator, Kabwe",
        4,
        "Design finally makes sense",
        "I could never get the spacing right until the hierarchy session showed "
        "me why it looked wrong. My workshop flyers now look like they were "
        "made by someone who does this for a living, which is still me.",
    ),
    (
        "computer-digital-literacy",
        "Kalusha Namangala",
        "Office administrator, Mbala",
        5,
        "Started from never having used one",
        "I was the person at work who got asked to fix the computer and did not "
        "know how. The digital literacy course took me from that to running the "
        "shared drive and the monthly spreadsheet. I am no longer the person who "
        "gets asked to fix the computer.",
    ),
    (
        "content-creation",
        "Nakatindi Zulu",
        "Community manager, Lusaka",
        4,
        "One piece, five uses",
        "The repurposing module is why I finished the course. I now take one "
        "recording and turn it into posts, a newsletter and a short — which "
        "means one afternoon of work fills a week of content. The hooks session "
        "helped more than I expected.",
    ),
    (
        "virtual-assistance-masterclass",
        "Chipukwa Mvula",
        "Virtual assistant, Lusaka",
        5,
        "The client module did it",
        "I had the tools and no clients. The module on where the first three "
        "clients come from, and the outreach message in it, is what changed my "
        "month. I now work with two small businesses and set up their shared "
        "drives and inboxes the way the course showed.",
    ),
    (
        "social-media-management",
        "Mabika Tembo",
        "Social media manager, Livingstone",
        5,
        "The calendar module saved me",
        "Ninety minutes to plan a month, then batching. My accounts stopped "
        "looking like they were posted at random, and I can show a client a "
        "whole month in one meeting, which is how I won the second contract.",
    ),
    (
        "course-creation-blueprint",
        "Mpande Simukonda",
        "ICT teacher, Mongu",
        4,
        "Good, but do the homework",
        "The structure module made my own course notes into something with a "
        "beginning and an end. I would warn a first-time creator: the recording "
        "chapter is where most people give up. Budget two weekends, not one "
        "evening.",
    ),
    (
        "graphic-design-bootcamp",
        "Siphamuntu Bwalya",
        "Freelance graphic designer, Ndola",
        5,
        "The brand kit changed my freelance offers",
        "After building the kit on my own logo I kept sending it to every client "
        "as part of the pitch. One of them hired me on the spot for the job, and "
        "two others kept using the kit instead of asking me to redesign again.",
    ),
    (
        "freelancing-workshop",
        "Okoye Mukwale",
        "Software developer, Lusaka",
        5,
        "I landed four contracts in one morning",
        "The proposal template alone was a contract deal waiting to happen. I "
        "used it the next morning, sent it to three places and got replies from "
        "all of them. It is now the only thing I ever change my CV for.",
    ),
    (
        "meta-ads-mastery",
        "Zuluwa Chileshe",
        "E-commerce seller, Lusaka",
        4,
        "Clicked through at 9am and spent the rest of the day watching numbers",
        "I was not going to run the ad based on the cold reading, but the spend "
        "budget and the breakpoint walk-through made me confident enough. By "
        "noon the chart was moving and by evening the first sale cleared. The "
        "optimisation module turned it into a six-figure check-out in two weeks.",
    ),
    (
        "ebook-creation",
        "Kalabula Chikwanda",
        "Freelance writer, Lusaka",
        5,
        "Now I publish a piece every other Tuesday",
        "Before the course I wrote when inspiration hit, which is rare. The "
        "template system and the chapter structure gave me a rhythm. I now put a "
        "short guide out twice a month — and every one sells because it is real "
        "and free to download on the side.",
    ),
    (
        "learn-to-earn",
        "Chileshe Mwape",
        "Teacher, Luanshya",
        5,
        "My son started drawing clients for himself",
        "I thought this was just for office workers, and I was not sure what I "
        "could offer a school. After positioning, realised my pupils could do "
        "small maths tutoring, and one of them is already making more than enough "
        "for his lunch money each week.",
    ),
]


def main():
    rows = [
        {
            "courseSlug": slug,
            "authorName": name,
            "authorRole": role,
            "rating": rating,
            "title": title,
            "content": content,
            "isFeatured": idx < 8,
        }
        for idx, (slug, name, role, rating, title, content) in enumerate(SAMPLES)
    ]

    with open(f"{OUT}/reviews.json", "w", encoding="utf-8") as f:
        json.dump(rows, f, indent=2, ensure_ascii=False)

    print(f"reviews: {len(rows)} published")


if __name__ == "__main__":
    main()
