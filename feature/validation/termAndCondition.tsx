import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

interface TermAndConditionProps {
  onClose: () => void;
  onAgree: () => void;
}

export default function TermAndCondition({
  onClose,
  onAgree,
}: TermAndConditionProps) {
  return (
    <View className="flex-1 bg-white">
      {/* Top Header */}
      <View className="flex-row items-center border-b border-gray-200 px-4 py-3">
        <TouchableOpacity onPress={onClose} className="p-2">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="ml-2 text-lg font-bold text-gray-900">
          UniSuki Terms and Conditions
        </Text>
      </View>

      {/* Main Scroll Content */}
      <ScrollView
        className="flex-1 px-6 pt-4"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={true}
      >
        <View className="mb-4 rounded-2xl bg-green-50 p-4">
          <Text className="text-sm leading-5 text-gray-700">
            By completing this form you have agreed with the Terms and
            Conditions. This is to help verify my identity and ensure the
            security of my account.
          </Text>
        </View>

        {/* Section 1 */}
        <View className="mb-6 gap-2">
          <Text className="text-base font-bold text-gray-900">
            1. Introduction
          </Text>
          <Text className="text-sm leading-5 text-gray-600">
            Welcome to UniSuki! By downloading, accessing, or using our mobile
            application, you automatically agree to be bound by these Terms and
            Conditions. These terms constitute a legally binding agreement
            between you and the UniSuki Capstone. If you do not agree to these
            terms, you must immediately cease using the application.
          </Text>
          <Text className="text-sm leading-5 text-gray-600">
            We provide a specialized platform designed exclusively for the
            community at the University of Cordilleras Grade School and Junior
            High School to buy, sell, or trade items—with a specific focus on
            school uniforms (like white polos, PE pants, and green vests)—safely
            and efficiently on campus.
          </Text>
        </View>

        {/* Section 2 */}
        <View className="mb-6 gap-2">
          <Text className="text-base font-bold text-gray-900">
            2. Eligibility
          </Text>
          <Text className="text-sm leading-5 text-gray-600">
            To be eligible to use Unisuki, you must satisfy the following
            criteria:
          </Text>
          <View className="mt-1 gap-2 pl-2">
            <View className="flex-row items-start gap-2">
              <Text className="text-xs text-gray-600">{"\u2B24"}</Text>
              <Text className="flex-1 text-sm leading-5 text-gray-600">
                You must be a currently enrolled student, an active
                faculty/staff member, or an alumni (provided you still possess
                and can present a valid school ID) at the University of
                Cordilleras Grade School and Junior High School.
              </Text>
            </View>
            <View className="flex-row items-start gap-2">
              <Text className="text-xs text-gray-600">{"\u2B24"}</Text>
              <Text className="flex-1 text-sm leading-5 text-gray-600">
                You must possess a valid, school-issued email address and use it
                for account registration.
              </Text>
            </View>
            <View className="flex-row items-start gap-2">
              <Text className="text-xs text-gray-600">{"\u2B24"}</Text>
              <Text className="flex-1 text-sm leading-5 text-gray-600">
                You must be at least 14 years of age. Users under the age of 18
                are expected to have discussed their use of the application and
                on-campus transactions with a parent or legal guardian.
              </Text>
            </View>
          </View>
        </View>

        {/* Section 3 */}
        <View className="mb-6 gap-2">
          <Text className="text-base font-bold text-gray-900">
            3. User Accounts and Verification
          </Text>
          <Text className="text-sm leading-5 text-gray-600">
            You are responsible for maintaining the confidentiality of your
            account login information. You agree that the school email address
            used for registration is yours and that all information provided
            during registration and listing creation is accurate, current, and
            truthful. Unisuki reserves the right to suspend or terminate
            accounts that provide false information or use non-school email
            addresses.
          </Text>
        </View>

        {/* Section 4 */}
        <View className="mb-6 gap-2">
          <Text className="text-base font-bold text-gray-900">
            4. The Unisuki Platform (Platform Only Disclaimer)
          </Text>
          <Text className="text-sm leading-5 text-gray-600">
            You understand and acknowledge that Unisuki acts solely as a
            technological facilitator to connect buyers and sellers within the
            school community. Unisuki:
          </Text>
          <View className="mt-1 gap-2 pl-2">
            <View className="flex-row items-start gap-2">
              <Text className="text-xs text-gray-600">{"\u2B24"}</Text>
              <Text className="flex-1 text-sm leading-5 text-gray-600">
                Does not own, sell, resell, distribute, or provide any of the
                goods listed in the application.
              </Text>
            </View>
            <View className="flex-row items-start gap-2">
              <Text className="text-xs text-gray-600">{"\u2B24"}</Text>
              <Text className="flex-1 text-sm leading-5 text-gray-600">
                Is not a party to any transactions, agreements, or disputes that
                may arise between users.
              </Text>
            </View>
          </View>
        </View>

        {/* Section 5 */}
        <View className="mb-6 gap-2">
          <Text className="text-base font-bold text-gray-900">
            5. Machine Learning (AI) Disclaimer
          </Text>
          <Text className="text-sm leading-5 text-gray-600">
            Unisuki utilizes a TensorFlow-based image recognition model (machine
            learning/AI) to assist in the categorization and tagging of listings
            (e.g., automatically identifying a photo as a "White Polo" or "Green
            Vest"). This feature is provided for convenience only.
          </Text>
          <Text className="text-sm font-semibold text-gray-700">
            You acknowledge that:
          </Text>
          <View className="gap-2 pl-2">
            <View className="flex-row items-start gap-2">
              <Text className="text-xs text-gray-600">{"\u2B24"}</Text>
              <Text className="flex-1 text-sm leading-5 text-gray-600">
                The AI model may provide inaccurate, incomplete, or incorrect
                categorizations.
              </Text>
            </View>
            <View className="flex-row items-start gap-2">
              <Text className="text-xs text-gray-600">{"\u2B24"}</Text>
              <Text className="flex-1 text-sm leading-5 text-gray-600">
                Sellers remain entirely responsible for verifying the accuracy
                of their listings, including description, price, condition, and
                uniform type, before publishing.
              </Text>
            </View>
            <View className="flex-row items-start gap-2">
              <Text className="text-xs text-gray-600">{"\u2B24"}</Text>
              <Text className="flex-1 text-sm leading-5 text-gray-600">
                UniSuki shall not be held liable for any damages or confusion
                resulting from incorrect automatic categorization.
              </Text>
            </View>
          </View>
        </View>

        {/* Section 6 */}
        <View className="mb-6 gap-2">
          <Text className="text-base font-bold text-gray-900">
            6. User Conduct
          </Text>
          <Text className="text-sm leading-5 text-gray-600">
            By using the app, you agree to conduct yourself responsibly,
            ethically, and strictly in accordance with school policies and
            applicable local laws. Prohibited conduct includes, but is not
            limited to:
          </Text>
          <View className="mt-1 gap-2 pl-2">
            <View className="flex-row items-start gap-2">
              <Text className="text-xs text-gray-600">{"\u2B24"}</Text>
              <Text className="flex-1 text-sm leading-5 text-gray-600">
                <Text className="font-semibold text-gray-800">
                  Academic Dishonesty:
                </Text>{" "}
                Selling or buying coursework, essays, tests, assignments, or
                unauthorized school materials.
              </Text>
            </View>
            <View className="flex-row items-start gap-2">
              <Text className="text-xs text-gray-600">{"\u2B24"}</Text>
              <Text className="flex-1 text-sm leading-5 text-gray-600">
                <Text className="font-semibold text-gray-800">Harassment:</Text>{" "}
                Engaging in bullying, hate speech, stalking, or any form of
                harassment against other students.
              </Text>
            </View>
            <View className="flex-row items-start gap-2">
              <Text className="text-xs text-gray-600">{"\u2B24"}</Text>
              <Text className="flex-1 text-sm leading-5 text-gray-600">
                <Text className="font-semibold text-gray-800">Fraud:</Text>{" "}
                Providing false information, misrepresenting items, or failing
                to deliver on agreed transactions.
              </Text>
            </View>
            <View className="flex-row items-start gap-2">
              <Text className="text-xs text-gray-600">{"\u2B24"}</Text>
              <Text className="flex-1 text-sm leading-5 text-gray-600">
                <Text className="font-semibold text-gray-800">
                  Inappropriate Content:
                </Text>{" "}
                Uploading nude, offensive, profane, or otherwise inappropriate
                imagery.
              </Text>
            </View>
            <View className="flex-row items-start gap-2">
              <Text className="text-xs text-gray-600">{"\u2B24"}</Text>
              <Text className="flex-1 text-sm leading-5 text-gray-600">
                <Text className="font-semibold text-gray-800">
                  Account Misuse:
                </Text>{" "}
                Attempting to access other users' accounts or distributing spam.
              </Text>
            </View>
          </View>
        </View>

        {/* Section 7 */}
        <View className="mb-6 gap-2">
          <Text className="text-base font-bold text-gray-900">
            7. Prohibited Items
          </Text>
          <Text className="text-sm leading-5 text-gray-600">
            The following items are strictly prohibited for sale on Unisuki.
            Attempting to list these items will result in immediate account
            termination:
          </Text>
          <View className="mt-1 gap-2 pl-2">
            {[
              "Illegal drugs, narcotics, or controlled substances.",
              "Alcohol and tobacco products.",
              "Weapons of any kind (firearms, knives, ammunition, explosives).",
              "Counterfeit goods or stolen property.",
              "Explicit adult materials or services.",
              "Prescription medications.",
              "Any items that violate the University of Cordilleras Student Code of Conduct.",
            ].map((item, idx) => (
              <View key={idx} className="flex-row items-start gap-2">
                <Text className="text-xs text-gray-600">{"\u2B24"}</Text>
                <Text className="flex-1 text-sm leading-5 text-gray-600">
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Section 8 */}
        <View className="mb-6 gap-2">
          <Text className="text-base font-bold text-gray-900">
            8. Safety Guidelines and Physical Transactions
          </Text>
          <Text className="text-sm leading-5 text-gray-600">
            Expanding upon the safety goals of this project, you agree to
            prioritize physical safety above all else.
          </Text>
          <View className="mt-1 gap-2 pl-2">
            <View className="flex-row items-start gap-2">
              <Text className="text-xs text-gray-600">{"\u2B24"}</Text>
              <Text className="flex-1 text-sm leading-5 text-gray-600">
                <Text className="font-semibold text-gray-800">
                  Meeting Locations:
                </Text>{" "}
                Always agree to meet in well-lit, populated, public locations
                exclusively on campus (e.g., the Library, Student Center, or
                Campus Security Office).
              </Text>
            </View>
            <View className="flex-row items-start gap-2">
              <Text className="text-xs text-gray-600">{"\u2B24"}</Text>
              <Text className="flex-1 text-sm leading-5 text-gray-600">
                <Text className="font-semibold text-gray-800">
                  Approved Meetup Hours:
                </Text>{" "}
                To ensure a secure environment, physical transactions and
                meetups may only be scheduled and conducted during official
                school hours, or up to a maximum of 30 minutes after standard
                dismissal time.
              </Text>
            </View>
            <View className="flex-row items-start gap-2">
              <Text className="text-xs text-gray-600">{"\u2B24"}</Text>
              <Text className="flex-1 text-sm leading-5 text-gray-600">
                <Text className="font-semibold text-gray-800">
                  Do Not Disclose Sensitive Data:
                </Text>{" "}
                Never share sensitive personal information (home address, bank
                details, passwords) with other users within the in-app chat.
              </Text>
            </View>
            <View className="flex-row items-start gap-2">
              <Text className="text-xs text-gray-600">{"\u2B24"}</Text>
              <Text className="flex-1 text-sm leading-5 text-gray-600">
                <Text className="font-semibold text-gray-800">
                  Bring a Friend:
                </Text>{" "}
                It is highly recommended to bring a classmate or friend to the
                meetup.
              </Text>
            </View>
          </View>
        </View>

        {/* Section 9 */}
        <View className="mb-6 gap-2">
          <Text className="text-base font-bold text-gray-900">
            9. Disputes Between Users
          </Text>
          <Text className="text-sm leading-5 text-gray-600">
            You acknowledge that disputes that may arise during a transaction
            (regarding quality, price, or delivery) are strictly between the
            buyer and seller. Unisuki, being a capstone project operated by
            students, possesses no authority, specialized mechanism, or
            obligation to mediate, resolve, or intervene in user disputes.
          </Text>
        </View>

        {/* Section 10 */}
        <View className="mb-6 gap-2">
          <Text className="text-base font-bold text-gray-900">
            10. Limitation of Liability
          </Text>
          <Text className="text-sm uppercase leading-5 text-gray-600">
            To the maximum extent permitted by applicable law, the UniSuki
            capstone team, operating as a student educational initiative, shall
            not be liable for any damages of any kind, including but not limited
            to direct, indirect, incidental, punitive, or consequential damages,
            loss of data, loss of income, or physical harm arising from your use
            of the application or from any transactions initiated within the
            app. You use the platform at your own sole risk.
          </Text>
        </View>

        {/* Section 11 */}
        <View className="mb-6 gap-2">
          <Text className="text-base font-bold text-gray-900">
            11. Termination
          </Text>
          <Text className="text-sm leading-5 text-gray-600">
            Unisuki reserves the right, at its sole discretion, to suspend or
            terminate your account and deny access to the application
            immediately and without notice, for any violation of these Terms and
            Conditions or for conduct that Unisuki determines is harmful to the
            school community.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
