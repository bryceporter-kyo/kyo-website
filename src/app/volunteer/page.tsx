"use client";

import React, { useState, useEffect } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useImages } from "@/components/providers/ImageProvider";
import {
  Heart, Handshake, Gift, Star, Ticket, Users, Camera, Wrench,
  ShieldCheck, Sparkles, ArrowRight, CheckCircle2, MessageSquare,
  Music, Clock, MapPin, Award, BookOpen, Utensils, GraduationCap,
  Briefcase, BarChart2, Megaphone, DollarSign, Building2, Calendar, HelpCircle
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getLinkById } from "@/lib/links";
import { fetchButtonsFromFirebase, ButtonConfig } from "@/lib/buttons";

const volunteerRoles = [
  {
    icon: Ticket,
    title: "Concert & Event Support",
    category: "Events",
    description: "Be the friendly face of KYO. Assist with ushering, ticket-taking, and merchandise at our grand performances.",
    impact: "Ensures professional audience experiences",
  },
  {
    icon: Users,
    title: "Program Assistance",
    category: "Education",
    description: "Lend a hand during our weekly Upbeat! program. Assist with check-in, meal service, and student safety.",
    impact: "Creates a safe environment for kids",
  },
  {
    icon: Camera,
    title: "Creative & Technical",
    category: "Operations",
    description: "Put your talents to use in photography, digital recording, instrument maintenance, or post-production.",
    impact: "Captures and preserves our legacy",
  },
  {
    icon: Handshake,
    title: "Operational Support",
    category: "Admin",
    description: "Assist with bookkeeping, data management, or event coordination to help our day-to-day run smoothly.",
    impact: "Supports long-term organizational success",
  },
];

const steps = [
  {
    icon: CheckCircle2,
    title: "Let Us Know You're Interested",
    desc: "Fill out our quick application form to start your journey with the KYO.",
  },
  {
    icon: MessageSquare,
    title: "The Conversation",
    desc: "We'll have a brief chat about your unique skills, interests, and how they align with our current needs.",
  },
  {
    icon: ShieldCheck,
    title: "Supportive Screening",
    desc: "Depending on your role, we'll guide you through a vulnerable sector check to ensure student safety.",
  },
  {
    icon: Calendar,
    title: "Orientation & Training",
    desc: "We'll set you up for success with role-specific training, scheduling, and a full team orientation.",
  },
  {
    icon: Music,
    title: "Start Making Music",
    desc: "Join the team at an upcoming event and see your impact in action within our community.",
  },
];

const volunteerFaqs = [
  {
    q: "Do I need special skills or experience?",
    a: "Not at all — we have roles for everyone. If you have a specific skill set like photography, bookkeeping, or instrument repair, we'd love to put it to good use, but enthusiasm and a willingness to help are all that's really required.",
  },
  {
    q: "How much time do I need to commit?",
    a: "As much or as little as you're able to give. Some volunteers help out at a single concert, while others join us on a weekly basis. We'll work with your schedule to find the right fit.",
  },
  {
    q: "Can students receive community service hours?",
    a: "Yes — please reach out and we'll be happy to provide documentation for volunteer hours completed with the KYO.",
  },
];

const boardDirectorTypes = [
  {
    icon: Briefcase,
    type: "Voting Director",
    description:
      "Serve in a general governance capacity, helping guide the organization's strategic direction and long-term health. No specific operational domain is required.",
    badge: "Recruiting",
  },
  {
    icon: Star,
    type: "Functional Director",
    description:
      "Hold a dual role: voting board member and operational lead in a specific area such as marketing, finance, business development, or fundraising. Comes with a formal title, mentorship, and a letter of recommendation upon completion of your term.",
    badge: "5 Roles Open",
  },
  {
    icon: Music,
    type: "Student Director (Non-Voting)",
    description:
      "Elected representatives from the Intermediate (IKYO) and Senior (SKYO) orchestras, giving our musicians a voice at the leadership table where possible.",
    badge: "Via Orchestras",
  },
];

const functionalRoles = [
  { icon: DollarSign, title: "Director of Grant Funding & Partnerships", desc: "Oversee grant financial management, compliance, budgeting, and funder reporting. Ideal for professionals in nonprofit finance, grant administration, or accounting." },
  { icon: Building2, title: "Director of Corporate Relations", desc: "Cultivate institutional giving and foundation partnerships. Ideal for professionals in B2B relationship management, major gifts, or institutional fundraising." },
  { icon: GraduationCap, title: "Director of Institutional Giving", desc: "Develop and manage digital advertising strategy across Google and Meta platforms. Ideal for digital marketing professionals at the manager or senior advisor level." },
  { icon: BarChart2, title: "Director of Business Development", desc: "Drive organizational growth through partnerships, sponsorships, and revenue strategies. Ideal for sales, BD, or corporate strategy professionals." },
  { icon: Megaphone, title: "Director of Marketing & Communications", desc: "Lead social media strategy and digital advertising. Ideal for marketing managers, communications specialists, or digital strategists." },
];

const boardFaqs = [
  {
    q: "What is a Functional Director?",
    a: "A Functional Director is a voting board member who also leads a dedicated area of KYO's operations. You hold a formal Director title, contribute your professional expertise directly to our work, and help shape the organization at the leadership table. It's a real leadership role — not a figurehead position.",
  },
  {
    q: "What do Functional Directors receive at the end of their term?",
    a: "Upon completing your term in good standing, you'll receive a formal letter of recommendation from the Board Chair (using your Director title), a copy of your official job description, and a curated record of your documented achievements — all designed to support your professional portfolio and career development.",
  },
  {
    q: "How much time does a board role require?",
    a: "Functional Directors commit approximately 5 hours per week, designed to work alongside your existing professional and personal life. All board terms are two years, with the opportunity to renew for up to four consecutive terms.",
  },
  {
    q: "Do I need a background in music or the arts?",
    a: "Not at all. For Functional Director roles, we're looking for professionals whose expertise matches our open positions. For Voting Director roles, a genuine commitment to accessible arts education and community impact is what matters most.",
  },
  {
    q: "What does the onboarding process look like?",
    a: "It begins with an introductory conversation with our HR & Compliance Committee, followed by a board vote for provisional approval. You then complete a 4-month onboarding period — during which all board rights and responsibilities apply — before final appointment by majority board vote. It's designed to be a genuine, low-pressure fit-check for both sides.",
  },
  {
    q: "Can KYO alumni or community members apply?",
    a: "Absolutely — and we encourage it. If you or your family have been part of KYO as musicians, parents, instructors, or supporters, your lived understanding of our mission is an invaluable asset at the leadership table.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export default function VolunteerPage() {
  const { getImage } = useImages();
  const [buttons, setButtons] = useState<ButtonConfig[]>([]);
  const [activeRoleIndex, setActiveRoleIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const headerImage = getImage("page-header-volunteer");
  const impactImage = getImage("support-volunteer");
  const ctaBackground = getImage("volunteer-cta");

  const CYCLE_DURATION = 8000; // 8 seconds per role
  const PROGRESS_INTERVAL = 50; // Update progress every 50ms

  useEffect(() => {
    const loadButtons = async () => {
      const data = await fetchButtonsFromFirebase();
      setButtons(data);
    };
    loadButtons();
  }, []);

  // Auto-cycle logic
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + (PROGRESS_INTERVAL / CYCLE_DURATION) * 100;
      });
    }, PROGRESS_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      setActiveRoleIndex((current) => (current + 1) % functionalRoles.length);
    }
  }, [progress]);

  const handleRoleSelect = (index: number) => {
    setActiveRoleIndex(index);
    setProgress(0);
  };

  const getButtonProps = (buttonConfig?: ButtonConfig) => {
    if (!buttonConfig || !buttonConfig.visible) return null;
    let href = "#";
    let target = "_self";
    if (buttonConfig.link.type === "external") {
      const link = getLinkById(buttonConfig.link.value);
      if (link) {
        href = link.url;
        target = "_blank";
      }
    } else {
      href = buttonConfig.link.value;
    }
    return { href, target, text: buttonConfig.text };
  };

  const mainButton = getButtonProps(buttons.find((b) => b.id === "volunteer-signup"));
  const secondaryButton = getButtonProps(buttons.find((b) => b.id === "volunteer-signup-secondary"));
  const boardButton = getButtonProps(buttons.find((b) => b.id === "board-apply"));

  return (
    <div className="relative overflow-hidden bg-background min-h-screen">
      {/* Ambient Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[10%] -right-[5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] -left-[5%] w-[35%] h-[35%] bg-secondary/10 rounded-full blur-[100px]" />
      </div>

      <PageHeader
        title="Share Your Talent"
        subtitle="Join our community of dedicated volunteers and help us empower the next generation of musicians."
        image={headerImage}
      />

      {/* 12:1 Ratio Banner */}
      <section className="bg-primary py-16 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-4"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-white/50">The power behind the music</p>
            <div className="text-[5rem] md:text-[7rem] font-headline font-bold text-white leading-none">
              12<span className="text-white/40">:</span>1
            </div>
            <p className="text-white/70 font-light text-lg max-w-2xl mx-auto leading-relaxed">
              For every paid hour at the KYO, our volunteers contribute twelve. The Kawartha Youth Orchestra exists because people choose to show up — not because they have to, but because they believe every child deserves music.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-32 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest border border-primary/10">
                <Heart className="w-4 h-4 animate-pulse" />
                <span>Our Heartbeat</span>
              </div>
              <h2 className="text-5xl font-headline font-bold leading-tight">Be the Power Behind the Performance</h2>
              <div className="space-y-6 text-muted-foreground text-lg font-light leading-relaxed">
                <p>
                  Volunteers are the vital force that keeps the KYO moving forward. From the concert stage to the administrative office, your time and dedication ensure that our young musicians have the resources and support they need to succeed.
                </p>
                <p>
                  By giving your time, you're not just helping with tasks — you're becoming a role model for our students and a cornerstone of the Peterborough arts community.
                </p>
              </div>

              <div className="flex flex-wrap gap-6 pt-4">
                <motion.div 
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">Flexible Commitment</div>
                    <div className="text-xs text-muted-foreground">From one-day events to weekly programs</div>
                  </div>
                </motion.div>
                <motion.div 
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">Skill Development</div>
                    <div className="text-xs text-muted-foreground">Learn new skills while giving back</div>
                  </div>
                </motion.div>
              </div>

              {mainButton && (
                <div className="pt-6">
                  <Button asChild size="lg" className="rounded-2xl px-12 py-8 bg-primary hover:bg-primary/90 text-white font-bold shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                    <Link href={mainButton.href} target={mainButton.target} rel={mainButton.target === "_blank" ? "noopener noreferrer" : ""}>
                      {mainButton.text}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-primary/5 rounded-[3rem] blur-3xl -z-10" />
              {impactImage && (
                <div className="rounded-[3rem] overflow-hidden shadow-2xl aspect-video lg:aspect-square relative group">
                  <Image
                    src={impactImage.imageUrl}
                    alt={impactImage.description}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    data-ai-hint={impactImage.imageHint}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="absolute bottom-10 left-10 right-10 p-8 rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/20 text-white"
                  >
                    <p className="text-lg font-light italic">"Volunteering at KYO isn't just about helping out; it's about being part of a family that transforms lives through music."</p>
                    <div className="mt-4 text-sm font-bold">— Long-time KYO Volunteer</div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-32 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('/grid.svg')]" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20 space-y-4"
          >
            <div className="flex justify-center items-center gap-2 text-white/60">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest text-white/80">Opportunity Awaits</span>
            </div>
            <h2 className="text-4xl font-headline font-bold text-white">How You Can Help</h2>
            <p className="text-white/70 max-w-2xl mx-auto font-light">
              We have a variety of roles to match your skills, interests, and availability. Find the perfect fit and start making a difference today.
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {volunteerRoles.map((role) => (
              <motion.div
                key={role.title}
                variants={itemVariants}
                whileHover={{ y: -10 }}
              >
                <Card className="h-full bg-white border-none rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-primary/20 flex flex-col group">
                  <CardHeader className="p-8 pb-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary mb-6 transition-all group-hover:scale-110 group-hover:rotate-6 group-hover:bg-primary group-hover:text-white">
                      <role.icon className="w-6 h-6" />
                    </div>
                    <Badge variant="secondary" className="w-fit mb-2 bg-slate-100 text-slate-600 border-none font-bold uppercase tracking-wider text-[10px]">
                      {role.category}
                    </Badge>
                    <CardTitle className="text-xl font-headline font-bold text-slate-900">{role.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-8 pb-4 flex-grow">
                    <p className="text-sm text-slate-600 leading-relaxed font-light">{role.description}</p>
                  </CardContent>
                  <CardFooter className="px-8 pb-8 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-primary text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{role.impact}</span>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* The Journey Map */}
      <section className="py-32 bg-white px-4 relative overflow-hidden">
        <div className="container mx-auto max-w-5xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24 space-y-4"
          >
            <h2 className="text-5xl font-headline font-bold">Your Journey Begins Here</h2>
            <p className="text-muted-foreground font-light max-w-xl mx-auto text-lg">Getting started is a collaborative process. We’ll walk you through every step of joining our community.</p>
          </motion.div>

          <div className="relative">
            {/* The Central Path Line */}
            <motion.div 
              initial={{ height: 0 }}
              whileInView={{ height: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute left-1/2 top-0 w-1 bg-slate-100 -translate-x-1/2 hidden md:block origin-top" 
            />

            <div className="space-y-24 relative">
              {steps.map((step, idx) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: idx * 0.1 }}
                  className={cn(
                    "flex flex-col md:flex-row items-center gap-8 md:gap-0",
                    idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  )}
                >
                  {/* Content Block */}
                  <div className="w-full md:w-1/2 flex justify-center md:justify-end px-4 md:px-12">
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className={cn(
                        "max-w-sm space-y-4 text-center md:text-left p-6 rounded-3xl transition-colors hover:bg-slate-50",
                        idx % 2 !== 0 && "md:text-left"
                      )}
                    >
                      <div className="text-xs font-bold text-primary uppercase tracking-[0.2em]">Step 0{idx + 1}</div>
                      <h3 className="text-2xl font-headline font-bold text-slate-900">{step.title}</h3>
                      <p className="text-muted-foreground font-light leading-relaxed">
                        {step.desc}
                      </p>
                    </motion.div>
                  </div>

                  {/* Marker Hub */}
                  <div className="relative z-10 flex items-center justify-center">
                    <motion.div 
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                      className="w-16 h-16 rounded-[1.5rem] bg-white shadow-2xl border border-slate-100 flex items-center justify-center text-primary ring-8 ring-white cursor-pointer"
                    >
                      <step.icon className="w-7 h-7" />
                    </motion.div>
                  </div>

                  {/* Empty Spacer for alternating layout */}
                  <div className="w-full md:w-1/2 hidden md:block" />
                </motion.div>
              ))}
            </div>

            {/* Final Destination Marker */}
            <motion.div 
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1, type: "spring" }}
              className="mt-24 flex justify-center"
            >
              <div className="w-4 h-4 rounded-full bg-primary ring-8 ring-primary/10 animate-pulse" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Volunteer FAQs */}
      <section className="py-24 px-4 bg-secondary">
        <div className="container mx-auto max-w-3xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 space-y-4"
          >
            <h2 className="text-4xl font-headline font-bold">Volunteer FAQs</h2>
            <p className="text-muted-foreground font-light max-w-xl mx-auto">Everything you need to know about getting involved.</p>
          </motion.div>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-6"
          >
            {volunteerFaqs.map((faq, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ scale: 1.01, x: 5 }}
                className="border border-border rounded-2xl p-8 bg-background shadow-sm hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex gap-4">
                  <div className="mt-1">
                    <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-lg mb-3">{faq.q}</h3>
                    <p className="text-muted-foreground font-light leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Board of Directors Section */}
      <section className="py-32 px-4 bg-background">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20 space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest border border-primary/10">
              <Briefcase className="w-4 h-4" />
              <span>Leadership</span>
            </div>
            <h2 className="text-4xl font-headline font-bold">Join Our Board of Directors</h2>
            <p className="text-muted-foreground font-light max-w-2xl mx-auto text-lg leading-relaxed">
              Are you a skilled professional looking to take on a meaningful leadership role while making a difference in the lives of young people? The KYO is actively recruiting for our Board of Directors — and there are several ways to get involved at the governance level, whether you're bringing professional expertise, community passion, or both.
            </p>
            <p className="text-muted-foreground font-light max-w-2xl mx-auto">
              This is not a traditional volunteer role. Board Directors hold formal titles, vote on organizational matters, and help shape KYO's future at the highest level.
            </p>
          </motion.div>

          {/* Director Type Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {boardDirectorTypes.map((type, idx) => (
              <motion.div
                key={type.type}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full rounded-[2rem] border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col group">
                  <CardHeader className="p-8 pb-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary mb-4 transition-transform group-hover:scale-110">
                      <type.icon className="w-6 h-6" />
                    </div>
                    <Badge variant="secondary" className="w-fit mb-3 bg-primary/10 text-primary border-none font-bold uppercase tracking-wider text-[10px]">
                      {type.badge}
                    </Badge>
                    <CardTitle className="text-xl font-headline font-bold">{type.type}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-8 pb-8 flex-grow">
                    <p className="text-sm text-muted-foreground leading-relaxed font-light">{type.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Open Functional Roles - MASTER-DETAIL LAYOUT */}
          <div className="mb-20">
            <div className="text-center mb-16 space-y-3">
              <div className="flex justify-center items-center gap-2 text-primary/60">
                <Star className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest text-primary/80">Currently Recruiting</span>
              </div>
              <h3 className="text-4xl font-headline font-bold">Open Functional Director Roles</h3>
              <p className="text-muted-foreground font-light max-w-xl mx-auto text-lg">Select a role to explore detailed responsibilities and requirements.</p>
            </div>

            <div className="grid lg:grid-cols-12 gap-12 items-start">
              {/* Role Selectors - Left Side */}
              <div className="lg:col-span-5 space-y-4">
                {functionalRoles.map((role, idx) => (
                  <button
                    key={role.title}
                    onClick={() => handleRoleSelect(idx)}
                    className={cn(
                      "w-full text-left p-6 rounded-2xl border transition-all duration-300 flex items-center gap-4 group relative overflow-hidden",
                      activeRoleIndex === idx 
                        ? "bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-[1.02]" 
                        : "bg-white text-slate-600 border-slate-100 hover:border-primary/30 hover:bg-slate-50"
                    )}
                  >
                    {/* Progress Bar Background */}
                    {activeRoleIndex === idx && (
                      <motion.div 
                        className="absolute bottom-0 left-0 h-1 bg-white/30 z-20"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.1, ease: "linear" }}
                      />
                    )}

                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-colors relative z-10",
                      activeRoleIndex === idx ? "bg-white/20" : "bg-primary/5 text-primary"
                    )}>
                      <role.icon className="w-5 h-5" />
                    </div>
                    <span className="font-headline font-bold text-sm md:text-base leading-tight flex-grow relative z-10">{role.title}</span>
                    <ArrowRight className={cn(
                      "w-4 h-4 transition-transform relative z-10",
                      activeRoleIndex === idx ? "translate-x-1 opacity-100" : "opacity-0 -translate-x-2"
                    )} />
                  </button>
                ))}
              </div>

              {/* Role Detail - Right Side */}
              <div className="lg:col-span-7 sticky top-32">
                <motion.div
                  key={activeRoleIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="rounded-[3rem] border-none shadow-2xl bg-white overflow-hidden p-8 md:p-12 relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[4rem]" />
                    
                    <div className="relative space-y-8">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                          {React.createElement(functionalRoles[activeRoleIndex].icon, { className: "w-8 h-8" })}
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs font-bold text-primary uppercase tracking-[0.2em]">Functional Director</div>
                          <h4 className="text-2xl md:text-3xl font-headline font-bold text-slate-900 leading-tight">
                            {functionalRoles[activeRoleIndex].title}
                          </h4>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="text-lg text-slate-600 font-light leading-relaxed border-l-2 border-primary/20 pl-6 py-2">
                          {functionalRoles[activeRoleIndex].desc}
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6 pt-4">
                          <div className="p-6 rounded-2xl bg-slate-50 space-y-2">
                            <h5 className="text-xs font-bold uppercase tracking-widest text-slate-400">Time Commitment</h5>
                            <p className="text-sm font-bold text-slate-900">Approx. 5 Hours / Week</p>
                          </div>
                          <div className="p-6 rounded-2xl bg-slate-50 space-y-2">
                            <h5 className="text-xs font-bold uppercase tracking-widest text-slate-400">Term Length</h5>
                            <p className="text-sm font-bold text-slate-900">2 Year Initial Appointment</p>
                          </div>
                        </div>

                        <div className="pt-6">
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Upon successful completion of your term, you will receive a formal letter of recommendation and a curated achievement record to support your professional portfolio.
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Board FAQs */}
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12 space-y-3">
              <h3 className="text-3xl font-headline font-bold">Board FAQs</h3>
              <p className="text-muted-foreground font-light">Common questions about joining the KYO Board of Directors.</p>
            </div>
            <div className="space-y-6">
              {boardFaqs.map((faq, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.07 }}
                  className="border border-border rounded-2xl p-8 bg-background"
                >
                  <h3 className="font-headline font-bold text-lg mb-3">{faq.q}</h3>
                  <p className="text-muted-foreground font-light leading-relaxed">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Board CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center p-12 rounded-[2rem] bg-secondary border border-border"
          >
            <h3 className="text-2xl font-headline font-bold mb-3">Ready to Lead?</h3>
            <p className="text-muted-foreground font-light mb-8 max-w-lg mx-auto">
              The onboarding process begins with a conversation. Reach out and we'll find the right fit together.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              {boardButton ? (
                <Button asChild size="lg" className="rounded-2xl px-10 py-7 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105">
                  <Link href={boardButton.href} target={boardButton.target} rel={boardButton.target === "_blank" ? "noopener noreferrer" : ""}>
                    {boardButton.text}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              ) : (
                <Button asChild size="lg" className="rounded-2xl px-10 py-7 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105">
                  <Link href="mailto:chair@thekyo.ca">
                    Email chair@thekyo.ca
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final Volunteer CTA */}
      <section className="py-32 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-[4rem] overflow-hidden bg-primary text-white p-12 md:p-24 shadow-2xl"
          >
            {ctaBackground && (
              <div className="absolute inset-0 opacity-20 scale-105">
                <Image
                  src={ctaBackground.imageUrl}
                  alt={ctaBackground.description}
                  fill
                  className="object-cover"
                  data-ai-hint={ctaBackground.imageHint}
                />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-transparent" />

            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white border border-white/20 text-xs font-bold uppercase tracking-widest">
                  <Users className="w-3 h-3" />
                  <span>Ready to Begin?</span>
                </div>
                <h2 className="text-5xl font-headline font-bold leading-tight">Your Talent is the Missing Note</h2>
                <p className="text-xl text-white/80 font-light leading-relaxed max-w-xl mx-auto md:mx-0">
                  Whether you can spare a few hours or a few days, your presence makes a profound difference in the lives of our musicians.
                </p>
                <div className="pt-4 flex flex-wrap justify-center md:justify-start gap-4">
                  {secondaryButton && (
                    <Button asChild size="lg" className="rounded-2xl px-12 py-8 bg-white text-primary hover:bg-white/90 text-lg font-bold shadow-xl transition-all hover:scale-105">
                      <Link href={secondaryButton.href} target={secondaryButton.target} rel={secondaryButton.target === "_blank" ? "noopener noreferrer" : ""}>
                        {secondaryButton.text}
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}