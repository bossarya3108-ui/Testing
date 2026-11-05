"""Narration script for the GPP explainer.

`tts` is the exact text sent to the neural voice. It contains phonetic
spellings where the voice would otherwise mispronounce payment terminology.
Captions are rebuilt from the same tokens and mapped back to the correct
technical spellings (pacs.008, camt.056, ISO 20022, ...).
"""

VOICE = "en-GB-SoniaNeural"
RATE = "+55%"
PITCH = "-2Hz"
LEAD_IN = 0.55  # visual beat before the narrator starts a scene
TAIL = 0.70     # breathing room after the last word

SCENES = [
    {
        "id": 1,
        "slug": "intro",
        "section": "THE PAYMENT LANDSCAPE",
        "title": "Introduction to GPP",
        "tts": (
            "Every day, banks process thousands of payments across countries, currencies and "
            "financial institutions. To manage these transactions efficiently, banks rely on "
            "powerful payment-processing platforms. One such platform is the Global Payments "
            "Platform, commonly known as GPP. Let's understand what it does and how it fits "
            "into the payment ecosystem."
        ),
        "markers": [
            ("institutions", "institutions", 1),
            ("platforms", "platforms", 1),
            ("global", "global", 1),
            ("gpp", "gpp", 1),
            ("ecosystem", "ecosystem", 1),
        ],
    },
    {
        "id": 2,
        "slug": "ecosystem",
        "section": "WHERE GPP FITS",
        "title": "The payment ecosystem",
        "tts": (
            "Let's look at where GPP fits. In our project context, an incoming payment "
            "instruction can travel from the sending bank through the SWIFT network and reach "
            "the Payments Management Gateway, or PMG. PMG acts as an integration point between "
            "SWIFT and the downstream payment-processing environment. Depending on the "
            "configured flow, the payment can be directed towards the legacy IPS engine or the "
            "newer GPP platform. The migration from IPS to GPP is intended to transition payment "
            "processing onto the target platform."
        ),
        "markers": [
            ("fits", "fits", 1),
            ("sending", "sending", 1),
            ("swift", "swift", 1),
            ("pmg", "pmg", 1),
            ("downstream", "downstream", 1),
            ("ips", "ips", 1),
            ("gpp", "gpp", 2),
            ("migration", "migration", 1),
            ("target", "target", 1),
        ],
    },
    {
        "id": 3,
        "slug": "processing",
        "section": "INSIDE THE ENGINE",
        "title": "How GPP processes a payment",
        "tts": (
            "Once the payment reaches GPP, the platform processes it through a series of steps. "
            "First, it receives the payment instruction. Next, it performs validation to check "
            "whether the message and its business data meet the required criteria. Configured "
            "business rules are then applied to determine how the payment should be handled. "
            "The transaction is subsequently routed for further processing. Finally, the platform "
            "generates or updates payment statuses so that downstream systems and operational "
            "teams can track what happened."
        ),
        "markers": [
            ("gpp", "gpp", 1),
            ("receives", "receives", 1),
            ("validation", "validation", 1),
            ("rules", "rules", 1),
            ("routed", "routed", 1),
            ("finally", "finally", 1),
            ("statuses", "statuses", 1),
        ],
    },
    {
        "id": 4,
        "slug": "messages",
        "section": "ISO 20022 MESSAGING",
        "title": "Understanding ISO 20022 messages",
        "tts": (
            "To understand GPP, it is also important to understand I S O twenty thousand twenty "
            "two messaging. These messages provide a structured way for financial institutions to "
            "exchange payment information. For example, packs zero zero eight is used for a "
            "financial institution-to-financial institution customer credit transfer, while packs "
            "zero zero nine represents a financial institution-to-financial institution credit "
            "transfer. Packs zero zero two communicates payment status, packs zero zero four is "
            "used for payment returns, and camt zero five six is a payment cancellation request. "
            "Understanding the purpose of each message helps a Business Analyst trace payment "
            "journeys and investigate exceptions."
        ),
        "markers": [
            ("iso", "i", 1),
            ("pacs008", "packs", 1),
            ("pacs009", "packs", 2),
            ("pacs002", "packs", 3),
            ("pacs004", "packs", 4),
            ("camt056", "camt", 1),
            ("exceptions", "exceptions", 1),
        ],
    },
    {
        "id": 5,
        "slug": "nostro",
        "section": "CORRESPONDENT BANKING",
        "title": "Nostro, Vostro and settlement",
        "tts": (
            "Another important concept is Noss-troh and Voss-troh accounts. A Noss-troh account "
            "is our bank's account maintained with another bank. A Voss-troh account is another "
            "bank's account maintained with us. These accounts are important in correspondent "
            "banking and cross-border settlement. Remember that sending a payment instruction and "
            "settling or posting the funds are related, but they are not necessarily the same event."
        ),
        "markers": [
            ("nostro1", "nosstroh", 1),
            ("nostro2", "nosstroh", 2),
            ("vostro1", "vosstroh", 1),
            ("vostro2", "vosstroh", 2),
            ("correspondent", "correspondent", 1),
            ("settlement", "settlement", 1),
            ("settling", "settling", 1),
            ("same", "same", 1),
        ],
    },
    {
        "id": 6,
        "slug": "exceptions",
        "section": "EXCEPTIONS & ANALYSIS",
        "title": "Exceptions and the BA role",
        "tts": (
            "But not every payment is successful. A transaction may fail validation or encounter "
            "a processing exception. In such cases, the platform and surrounding processes may "
            "generate a rejection status, such as a packs zero zero two, depending on the "
            "applicable flow. This is where operational procedures become important. A Business "
            "Analyst needs to understand what triggered the failure, which system generated the "
            "status, what downstream impact occurred, and how the exception is investigated and "
            "resolved."
        ),
        "markers": [
            ("successful", "successful", 1),
            ("fail", "fail", 1),
            ("rejection", "rejection", 1),
            ("pacs002", "packs", 1),
            ("operational", "operational", 1),
            ("triggered", "triggered", 1),
            ("system", "system", 1),
            ("impact", "impact", 1),
            ("investigated", "investigated", 1),
            ("resolved", "resolved", 1),
        ],
    },
    {
        "id": 7,
        "slug": "conclusion",
        "section": "THE ANALYST MINDSET",
        "title": "Conclusion",
        "tts": (
            "To become effective in payments analysis, don't just memorise message names. "
            "Understand the complete payment journey, how systems interact, how statuses are "
            "generated and what happens when something goes wrong. That is the foundation for "
            "understanding GPP from a Business Analyst's perspective."
        ),
        "markers": [
            ("journey", "journey", 1),
            ("systems", "systems", 1),
            ("statuses", "statuses", 1),
            ("wrong", "wrong", 1),
            ("foundation", "foundation", 1),
        ],
    },
]

# Phonetic TTS tokens -> technical display tokens.
DISPLAY_PHRASES = [
    (["packs", "zero", "zero", "eight"], "pacs.008"),
    (["packs", "zero", "zero", "nine"], "pacs.009"),
    (["packs", "zero", "zero", "two"], "pacs.002"),
    (["packs", "zero", "zero", "four"], "pacs.004"),
    (["camt", "zero", "five", "six"], "camt.056"),
    (["i", "s", "o", "twenty", "thousand", "twenty", "two"], "ISO 20022"),
    (["nosstroh"], "Nostro"),
    (["vosstroh"], "Vostro"),
]
