--
-- PostgreSQL database dump
--

-- Dumped from database version 16.6 (Postgres.app)
-- Dumped by pg_dump version 16.6 (Postgres.app)

-- Started on 2025-09-16 21:16:06 GMT

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 879 (class 1247 OID 57496)
-- Name: CreatorTier; Type: TYPE; Schema: public; Owner: MAC
--

CREATE TYPE public."CreatorTier" AS ENUM (
    'BRONZE',
    'SILVER',
    'GOLD',
    'PLATINUM'
);


ALTER TYPE public."CreatorTier" OWNER TO "MAC";

--
-- TOC entry 852 (class 1247 OID 57376)
-- Name: GroupStatus; Type: TYPE; Schema: public; Owner: MAC
--

CREATE TYPE public."GroupStatus" AS ENUM (
    'PENDING',
    'ACTIVE',
    'TESTING',
    'READY',
    'EXPIRED',
    'CANCELLED'
);


ALTER TYPE public."GroupStatus" OWNER TO "MAC";

--
-- TOC entry 849 (class 1247 OID 57368)
-- Name: NotificationStatus; Type: TYPE; Schema: public; Owner: MAC
--

CREATE TYPE public."NotificationStatus" AS ENUM (
    'UNREAD',
    'READ',
    'ARCHIVED'
);


ALTER TYPE public."NotificationStatus" OWNER TO "MAC";

--
-- TOC entry 846 (class 1247 OID 57345)
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: MAC
--

CREATE TYPE public."NotificationType" AS ENUM (
    'GROUP_CREDENTIALS_CHANGED',
    'GROUP_PAYMENT_REQUIRED',
    'GROUP_JOINED',
    'GROUP_ACTIVATED',
    'GROUP_MEMBER_JOINED',
    'GROUP_MEMBER_PAID',
    'WALLET_DEPOSIT',
    'WALLET_PAYMENT',
    'JOIN_REQUEST_APPROVED',
    'JOIN_REQUEST_DECLINED',
    'SYSTEM_ANNOUNCEMENT',
    'GROUP_JOIN_REQUEST'
);


ALTER TYPE public."NotificationType" OWNER TO "MAC";

--
-- TOC entry 873 (class 1247 OID 57479)
-- Name: UserRole; Type: TYPE; Schema: public; Owner: MAC
--

CREATE TYPE public."UserRole" AS ENUM (
    'USER',
    'CREATOR',
    'ADMIN'
);


ALTER TYPE public."UserRole" OWNER TO "MAC";

--
-- TOC entry 876 (class 1247 OID 57486)
-- Name: VerificationStatus; Type: TYPE; Schema: public; Owner: MAC
--

CREATE TYPE public."VerificationStatus" AS ENUM (
    'UNVERIFIED',
    'PENDING',
    'VERIFIED',
    'REJECTED'
);


ALTER TYPE public."VerificationStatus" OWNER TO "MAC";

--
-- TOC entry 858 (class 1247 OID 57404)
-- Name: WalletTransactionStatus; Type: TYPE; Schema: public; Owner: MAC
--

CREATE TYPE public."WalletTransactionStatus" AS ENUM (
    'PENDING',
    'COMPLETED',
    'FAILED',
    'CANCELLED'
);


ALTER TYPE public."WalletTransactionStatus" OWNER TO "MAC";

--
-- TOC entry 855 (class 1247 OID 57390)
-- Name: WalletTransactionType; Type: TYPE; Schema: public; Owner: MAC
--

CREATE TYPE public."WalletTransactionType" AS ENUM (
    'DEPOSIT',
    'WITHDRAWAL',
    'PAYMENT',
    'REFUND',
    'BONUS',
    'PENALTY'
);


ALTER TYPE public."WalletTransactionType" OWNER TO "MAC";

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 221 (class 1259 OID 57557)
-- Name: _CompanyCountries; Type: TABLE; Schema: public; Owner: MAC
--

CREATE TABLE public."_CompanyCountries" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_CompanyCountries" OWNER TO "MAC";

--
-- TOC entry 220 (class 1259 OID 57546)
-- Name: countries; Type: TABLE; Schema: public; Owner: MAC
--

CREATE TABLE public.countries (
    id text NOT NULL,
    name text NOT NULL,
    label text NOT NULL,
    code text NOT NULL,
    flag text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.countries OWNER TO "MAC";

--
-- TOC entry 216 (class 1259 OID 57423)
-- Name: groups; Type: TABLE; Schema: public; Owner: MAC
--

CREATE TABLE public.groups (
    id text NOT NULL,
    name text NOT NULL,
    service text NOT NULL,
    description text,
    price double precision NOT NULL,
    "maxMembers" integer NOT NULL,
    status public."GroupStatus" DEFAULT 'PENDING'::public."GroupStatus" NOT NULL,
    "ownerId" text NOT NULL,
    "inviteCode" text NOT NULL,
    "serviceEmail" text,
    "servicePassword" text,
    "serviceNotes" text,
    "credentialsSharedAt" timestamp(3) without time zone,
    "creatorBonus" double precision DEFAULT 500.0 NOT NULL,
    "testingPeriodDays" integer DEFAULT 7 NOT NULL,
    "activatedAt" timestamp(3) without time zone,
    "testingEndsAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone
);


ALTER TABLE public.groups OWNER TO "MAC";

--
-- TOC entry 215 (class 1259 OID 57413)
-- Name: notifications; Type: TABLE; Schema: public; Owner: MAC
--

CREATE TABLE public.notifications (
    id text NOT NULL,
    "userId" text NOT NULL,
    type public."NotificationType" NOT NULL,
    status public."NotificationStatus" DEFAULT 'UNREAD'::public."NotificationStatus" NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    metadata text,
    "groupId" text,
    "actionUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "readAt" timestamp(3) without time zone
);


ALTER TABLE public.notifications OWNER TO "MAC";

--
-- TOC entry 219 (class 1259 OID 57505)
-- Name: users; Type: TABLE; Schema: public; Owner: MAC
--

CREATE TABLE public.users (
    id text NOT NULL,
    name text,
    email text NOT NULL,
    "emailVerified" timestamp(3) without time zone,
    image text,
    password text,
    role public."UserRole" DEFAULT 'USER'::public."UserRole" NOT NULL,
    "verificationStatus" public."VerificationStatus" DEFAULT 'UNVERIFIED'::public."VerificationStatus" NOT NULL,
    "phoneNumber" text,
    "phoneVerified" boolean DEFAULT false NOT NULL,
    "identityVerified" boolean DEFAULT false NOT NULL,
    "trustScore" double precision DEFAULT 0.0 NOT NULL,
    "lastActiveAt" timestamp(3) without time zone,
    "loginAttempts" integer DEFAULT 0 NOT NULL,
    "isBlocked" boolean DEFAULT false NOT NULL,
    "blockedAt" timestamp(3) without time zone,
    "blockedReason" text,
    "creatorTier" public."CreatorTier" DEFAULT 'BRONZE'::public."CreatorTier" NOT NULL,
    "totalGroupsCreated" integer DEFAULT 0 NOT NULL,
    "successfulGroups" integer DEFAULT 0 NOT NULL,
    "averageRating" double precision DEFAULT 0.0 NOT NULL,
    "totalEarnings" double precision DEFAULT 0.0 NOT NULL,
    "averageActivationTime" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.users OWNER TO "MAC";

--
-- TOC entry 218 (class 1259 OID 57449)
-- Name: wallet_transactions; Type: TABLE; Schema: public; Owner: MAC
--

CREATE TABLE public.wallet_transactions (
    id text NOT NULL,
    "walletId" text NOT NULL,
    type public."WalletTransactionType" NOT NULL,
    amount double precision NOT NULL,
    "balanceBefore" double precision NOT NULL,
    "balanceAfter" double precision NOT NULL,
    currency text DEFAULT 'CFA'::text NOT NULL,
    status public."WalletTransactionStatus" DEFAULT 'PENDING'::public."WalletTransactionStatus" NOT NULL,
    reference text,
    "referenceType" text,
    "groupId" text,
    description text,
    metadata text,
    "paymentId" text,
    "paymentMethod" text,
    "processingFee" double precision DEFAULT 0.0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "completedAt" timestamp(3) without time zone
);


ALTER TABLE public.wallet_transactions OWNER TO "MAC";

--
-- TOC entry 217 (class 1259 OID 57435)
-- Name: wallets; Type: TABLE; Schema: public; Owner: MAC
--

CREATE TABLE public.wallets (
    id text NOT NULL,
    "userId" text NOT NULL,
    balance double precision DEFAULT 0.0 NOT NULL,
    currency text DEFAULT 'CFA'::text NOT NULL,
    "dailyLimit" double precision DEFAULT 100000.0 NOT NULL,
    "monthlyLimit" double precision DEFAULT 500000.0 NOT NULL,
    "isLocked" boolean DEFAULT false NOT NULL,
    "lockedReason" text,
    "lockedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.wallets OWNER TO "MAC";

--
-- TOC entry 3722 (class 0 OID 57557)
-- Dependencies: 221
-- Data for Name: _CompanyCountries; Type: TABLE DATA; Schema: public; Owner: MAC
--

COPY public."_CompanyCountries" ("A", "B") FROM stdin;
\.


--
-- TOC entry 3721 (class 0 OID 57546)
-- Dependencies: 220
-- Data for Name: countries; Type: TABLE DATA; Schema: public; Owner: MAC
--

COPY public.countries (id, name, label, code, flag, "isActive", "createdAt", "updatedAt") FROM stdin;
1a4fd39c-be48-494a-8a9f-ccaeb91d5639	TOGO	Togo	TG	🇹🇬	t	2025-07-27 11:34:06.932	2025-07-27 11:34:06.932
748799e6-0bd7-49e1-ac98-654db04f8f26	BENIN	Bénin	BJ	🇧🇯	t	2025-07-27 11:34:06.932	2025-07-27 11:34:06.932
00c9217b-3143-4449-8135-4309c44c8bba	BURKINA_FASO	Burkina Faso	BF	🇧🇫	t	2025-07-27 11:34:06.932	2025-07-27 11:34:06.932
e71d4c48-f777-4061-a6de-98fc1ec6c616	COTE_DIVOIRE	Côte d'Ivoire	CI	🇨🇮	t	2025-07-27 11:34:06.932	2025-07-27 11:34:06.932
414899d5-c069-42dc-b2b5-4bd2fc456cfe	SENEGAL	Sénégal	SN	🇸🇳	t	2025-07-27 11:34:06.932	2025-07-27 11:34:06.932
b2bb303c-026b-488a-8684-424d766a711e	MALI	Mali	ML	🇲🇱	t	2025-07-27 11:34:06.932	2025-07-27 11:34:06.932
55effb85-6940-4115-8371-f218e35dc491	NIGER	Niger	NE	🇳🇪	t	2025-07-27 11:34:06.932	2025-07-27 11:34:06.932
36244964-4568-47ef-ac5c-87504158ff8a	CAMEROUN	Cameroun	CM	🇨🇲	t	2025-07-27 11:34:06.932	2025-07-27 11:34:06.932
8d95b2da-7f37-4f89-9cc3-ef051a36a64b	GABON	Gabon	GA	🇬🇦	t	2025-07-27 11:34:06.932	2025-07-27 11:34:06.932
ce165883-72f6-4f26-a88c-ee1e55c92cf3	CONGO	Congo	CG	🇨🇬	t	2025-07-27 11:34:06.932	2025-07-27 11:34:06.932
\.


--
-- TOC entry 3717 (class 0 OID 57423)
-- Dependencies: 216
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: MAC
--

COPY public.groups (id, name, service, description, price, "maxMembers", status, "ownerId", "inviteCode", "serviceEmail", "servicePassword", "serviceNotes", "credentialsSharedAt", "creatorBonus", "testingPeriodDays", "activatedAt", "testingEndsAt", "createdAt", "updatedAt", "expiresAt") FROM stdin;
\.


--
-- TOC entry 3716 (class 0 OID 57413)
-- Dependencies: 215
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: MAC
--

COPY public.notifications (id, "userId", type, status, title, message, metadata, "groupId", "actionUrl", "createdAt", "updatedAt", "readAt") FROM stdin;
notif-1	test-user-1	SYSTEM_ANNOUNCEMENT	UNREAD	🎉 Bienvenue sur Miame !	Découvrez comment économiser sur vos abonnements en les partageant.	{"welcome": true, "test": true}	\N	\N	2025-06-03 16:25:24.613	2025-06-03 16:25:24.613	\N
notif-2	test-user-1	WALLET_DEPOSIT	UNREAD	💰 Portefeuille rechargé	Votre portefeuille a été rechargé de 50000 CFA.	{"amount": 50000, "currency": "CFA", "test": true}	\N	\N	2025-06-03 15:25:24.613	2025-06-03 15:25:24.613	\N
\.


--
-- TOC entry 3720 (class 0 OID 57505)
-- Dependencies: 219
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: MAC
--

COPY public.users (id, name, email, "emailVerified", image, password, role, "verificationStatus", "phoneNumber", "phoneVerified", "identityVerified", "trustScore", "lastActiveAt", "loginAttempts", "isBlocked", "blockedAt", "blockedReason", "creatorTier", "totalGroupsCreated", "successfulGroups", "averageRating", "totalEarnings", "averageActivationTime", "createdAt", "updatedAt") FROM stdin;
test-user-1	Utilisateur Test	test@miame.com	2025-06-03 16:25:50.631	\N	\N	USER	UNVERIFIED	\N	f	f	0	\N	0	f	\N	\N	BRONZE	0	0	0	0	0	2025-06-03 16:25:50.631	2025-06-03 16:25:50.631
\.


--
-- TOC entry 3719 (class 0 OID 57449)
-- Dependencies: 218
-- Data for Name: wallet_transactions; Type: TABLE DATA; Schema: public; Owner: MAC
--

COPY public.wallet_transactions (id, "walletId", type, amount, "balanceBefore", "balanceAfter", currency, status, reference, "referenceType", "groupId", description, metadata, "paymentId", "paymentMethod", "processingFee", "createdAt", "updatedAt", "completedAt") FROM stdin;
\.


--
-- TOC entry 3718 (class 0 OID 57435)
-- Dependencies: 217
-- Data for Name: wallets; Type: TABLE DATA; Schema: public; Owner: MAC
--

COPY public.wallets (id, "userId", balance, currency, "dailyLimit", "monthlyLimit", "isLocked", "lockedReason", "lockedAt", "createdAt", "updatedAt") FROM stdin;
wallet-test-1	test-user-1	50000	CFA	100000	500000	f	\N	\N	2025-06-03 16:25:24.609	2025-06-03 16:25:24.609
\.


--
-- TOC entry 3565 (class 2606 OID 57554)
-- Name: countries countries_pkey; Type: CONSTRAINT; Schema: public; Owner: MAC
--

ALTER TABLE ONLY public.countries
    ADD CONSTRAINT countries_pkey PRIMARY KEY (id);


--
-- TOC entry 3553 (class 2606 OID 57434)
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: MAC
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- TOC entry 3550 (class 2606 OID 57422)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: MAC
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 3561 (class 2606 OID 57526)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: MAC
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3558 (class 2606 OID 57460)
-- Name: wallet_transactions wallet_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: MAC
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT wallet_transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 3555 (class 2606 OID 57448)
-- Name: wallets wallets_pkey; Type: CONSTRAINT; Schema: public; Owner: MAC
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_pkey PRIMARY KEY (id);


--
-- TOC entry 3566 (class 1259 OID 57562)
-- Name: _CompanyCountries_AB_unique; Type: INDEX; Schema: public; Owner: MAC
--

CREATE UNIQUE INDEX "_CompanyCountries_AB_unique" ON public."_CompanyCountries" USING btree ("A", "B");


--
-- TOC entry 3567 (class 1259 OID 57563)
-- Name: _CompanyCountries_B_index; Type: INDEX; Schema: public; Owner: MAC
--

CREATE INDEX "_CompanyCountries_B_index" ON public."_CompanyCountries" USING btree ("B");


--
-- TOC entry 3562 (class 1259 OID 57556)
-- Name: countries_code_key; Type: INDEX; Schema: public; Owner: MAC
--

CREATE UNIQUE INDEX countries_code_key ON public.countries USING btree (code);


--
-- TOC entry 3563 (class 1259 OID 57555)
-- Name: countries_name_key; Type: INDEX; Schema: public; Owner: MAC
--

CREATE UNIQUE INDEX countries_name_key ON public.countries USING btree (name);


--
-- TOC entry 3551 (class 1259 OID 57476)
-- Name: groups_inviteCode_key; Type: INDEX; Schema: public; Owner: MAC
--

CREATE UNIQUE INDEX "groups_inviteCode_key" ON public.groups USING btree ("inviteCode");


--
-- TOC entry 3559 (class 1259 OID 57527)
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: MAC
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- TOC entry 3556 (class 1259 OID 57477)
-- Name: wallets_userId_key; Type: INDEX; Schema: public; Owner: MAC
--

CREATE UNIQUE INDEX "wallets_userId_key" ON public.wallets USING btree ("userId");


--
-- TOC entry 3572 (class 2606 OID 57564)
-- Name: _CompanyCountries _CompanyCountries_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: MAC
--

ALTER TABLE ONLY public."_CompanyCountries"
    ADD CONSTRAINT "_CompanyCountries_B_fkey" FOREIGN KEY ("B") REFERENCES public.countries(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3569 (class 2606 OID 57533)
-- Name: groups groups_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: MAC
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT "groups_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3568 (class 2606 OID 57461)
-- Name: notifications notifications_groupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: MAC
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES public.groups(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3570 (class 2606 OID 57471)
-- Name: wallet_transactions wallet_transactions_groupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: MAC
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT "wallet_transactions_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES public.groups(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3571 (class 2606 OID 57466)
-- Name: wallet_transactions wallet_transactions_walletId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: MAC
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT "wallet_transactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES public.wallets(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2025-09-16 21:16:06 GMT

--
-- PostgreSQL database dump complete
--

