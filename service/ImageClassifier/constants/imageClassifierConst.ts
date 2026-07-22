export const CLOTHING_LABELS = {
  UC_BLACK_PANTS: "Black Pants",
  UC_GRADE_SCHOOL_PE_PANTS: "PE Pants",
  UC_JUNIOR_HIGH_WHITE_POLO: "White Polo",
  UC_GREEN_VEST: "UC Green Vest",
  UC_PE_SHIRT: "PE Shirt",
} as const;

export const LABEL_TO_CATEGORY_MAPPING: {
  [key: string]: {
    category: string;
    titlePrefix: string;
    description: string;
    defaultPrice?: number;
  };
} = {
  [CLOTHING_LABELS.UC_PE_SHIRT]: {
    category: "Clothes",
    titlePrefix: "UC PE Shirt",
    description:
      "Selling my UC PE shirt. Used but in good condition, no stains or tears. PM me for more details.",
    defaultPrice: 150,
  },
  [CLOTHING_LABELS.UC_GRADE_SCHOOL_PE_PANTS]: {
    category: "Clothes",
    titlePrefix: "Grade School PE Pants",
    description:
      "UC Grade School PE pants for sale. Barely used, still looks brand new. Message me if interested.",
    defaultPrice: 220,
  },
  [CLOTHING_LABELS.UC_BLACK_PANTS]: {
    category: "Clothes",
    titlePrefix: "Black Uniform Pants",
    description:
      "Pre-loved black uniform pants. Washed and ironed. Fits waist 28-30. Let me know if you want to buy.",
    defaultPrice: 200,
  },
  [CLOTHING_LABELS.UC_JUNIOR_HIGH_WHITE_POLO]: {
    category: "Clothes",
    titlePrefix: "JHS White Polo",
    description:
      "Junior High School white polo. Good quality, selling because I graduated. Price is negotiable.",
    defaultPrice: 320,
  },
  [CLOTHING_LABELS.UC_GREEN_VEST]: {
    category: "Clothes",
    titlePrefix: "UC Green Vest",
    description:
      "UC Green vest, authentic. Only worn a few times during events. Good as new!",
    defaultPrice: 250,
  },
};

export const getCategoryFromLabel = (label: string) => {
  const normalizedLabel = label.trim().toLowerCase();

  const matchedEntry = Object.entries(LABEL_TO_CATEGORY_MAPPING).find(
    ([key]) => key.toLowerCase() === normalizedLabel,
  );

  if (matchedEntry) {
    return matchedEntry[1];
  }

  const vestFallback = normalizedLabel.includes("vest")
    ? {
        category: "Clothes",
        titlePrefix: "UC Green Vest",
        description:
          "UC Green vest, authentic. Only worn a few times during events. Good as new!",
        defaultPrice: 250,
      }
    : {
        category: "Miscellaneous",
        titlePrefix: "",
        description: "Please add a short description regarding the item.",
        defaultPrice: 0,
      };

  return vestFallback;
};

export const generateAutoFilledData = (label: string, confidence: number) => {
  const mapping = getCategoryFromLabel(label);

  // Ensure title is never empty
  const title = mapping.titlePrefix || `${mapping.category} Item`;

  return {
    title: title,
    price: mapping.defaultPrice?.toString() || "100",
    description: mapping.description,
    category: mapping.category,
  };
};
