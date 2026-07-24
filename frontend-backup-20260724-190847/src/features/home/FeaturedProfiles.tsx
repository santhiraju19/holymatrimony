"use client";

import { motion } from "framer-motion";

import ProfileCard from "@/components/cards/ProfileCard";
import SectionHeading from "@/components/common/SectionHeading";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";

import { featuredProfiles } from "@/data/home";

export default function FeaturedProfiles() {
  return (
    <Section className="bg-gradient-to-b from-slate-50 to-white">
      <Container>
        <SectionHeading
          badge="Featured Profiles"
          title="Meet Verified Christian Singles"
          description="Discover genuine, church-verified Christian brides and grooms who are looking for a God-centered lifelong relationship."
        />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-16 grid gap-8 sm:grid-cols-2 xl:grid-cols-4"
        >
          {featuredProfiles.map((profile, index) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: index * 0.1,
                duration: 0.45,
              }}
            >
              <ProfileCard
                {...profile}
                onViewProfile={(id) => {
                  console.log("View profile:", id);
                }}
                onFavourite={(id) => {
                  console.log("Favourite:", id);
                }}
              />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-14 text-center"
        >
          <button
            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 font-semibold text-white shadow-lg transition hover:scale-105 hover:shadow-xl"
          >
            View All Profiles
          </button>
        </motion.div>
      </Container>
    </Section>
  );
}