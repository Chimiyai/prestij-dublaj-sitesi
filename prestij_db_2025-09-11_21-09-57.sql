--
-- PostgreSQL database dump
--

\restrict rkpt8F3OyJZkPn4hI3nIM5pwY8cVNT8Gg2J96TxisehHtgStwEPv1F8h7KrRqQy

-- Dumped from database version 14.19 (Ubuntu 14.19-0ubuntu0.22.04.1)
-- Dumped by pg_dump version 14.19 (Ubuntu 14.19-0ubuntu0.22.04.1)

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
-- Name: ApplicationStatus; Type: TYPE; Schema: public; Owner: prestij_user
--

CREATE TYPE public."ApplicationStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."ApplicationStatus" OWNER TO prestij_user;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: prestij_user
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'COMPLETED',
    'FAILED',
    'REFUNDED'
);


ALTER TYPE public."PaymentStatus" OWNER TO prestij_user;

--
-- Name: RoleInProject; Type: TYPE; Schema: public; Owner: prestij_user
--

CREATE TYPE public."RoleInProject" AS ENUM (
    'VOICE_ACTOR',
    'MIX_MASTER',
    'MODDER',
    'TRANSLATOR',
    'SCRIPT_WRITER',
    'DIRECTOR'
);


ALTER TYPE public."RoleInProject" OWNER TO prestij_user;

--
-- Name: SuggestionStatus; Type: TYPE; Schema: public; Owner: prestij_user
--

CREATE TYPE public."SuggestionStatus" AS ENUM (
    'ACTIVE',
    'IN_PROGRESS',
    'COMPLETED',
    'ARCHIVED'
);


ALTER TYPE public."SuggestionStatus" OWNER TO prestij_user;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: prestij_user
--

CREATE TYPE public."UserRole" AS ENUM (
    'USER',
    'MODERATOR',
    'ADMIN'
);


ALTER TYPE public."UserRole" OWNER TO prestij_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: prestij_user
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO prestij_user;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: prestij_user
--

CREATE TABLE public.accounts (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


ALTER TABLE public.accounts OWNER TO prestij_user;

--
-- Name: accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: prestij_user
--

CREATE SEQUENCE public.accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.accounts_id_seq OWNER TO prestij_user;

--
-- Name: accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prestij_user
--

ALTER SEQUENCE public.accounts_id_seq OWNED BY public.accounts.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: prestij_user
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.categories OWNER TO prestij_user;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: prestij_user
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.categories_id_seq OWNER TO prestij_user;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prestij_user
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: character_dialogues; Type: TABLE; Schema: public; Owner: prestij_user
--

CREATE TABLE public.character_dialogues (
    id integer NOT NULL,
    "characterId" integer NOT NULL,
    "dialogueText" text NOT NULL,
    "originalVoiceUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.character_dialogues OWNER TO prestij_user;

--
-- Name: character_dialogues_id_seq; Type: SEQUENCE; Schema: public; Owner: prestij_user
--

CREATE SEQUENCE public.character_dialogues_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.character_dialogues_id_seq OWNER TO prestij_user;

--
-- Name: character_dialogues_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prestij_user
--

ALTER SEQUENCE public.character_dialogues_id_seq OWNED BY public.character_dialogues.id;


--
-- Name: comments; Type: TABLE; Schema: public; Owner: prestij_user
--

CREATE TABLE public.comments (
    id integer NOT NULL,
    content text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" integer NOT NULL,
    "projectId" integer NOT NULL
);


ALTER TABLE public.comments OWNER TO prestij_user;

--
-- Name: comments_id_seq; Type: SEQUENCE; Schema: public; Owner: prestij_user
--

CREATE SEQUENCE public.comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.comments_id_seq OWNER TO prestij_user;

--
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prestij_user
--

ALTER SEQUENCE public.comments_id_seq OWNED BY public.comments.id;


--
-- Name: community_suggestion_votes; Type: TABLE; Schema: public; Owner: prestij_user
--

CREATE TABLE public.community_suggestion_votes (
    "userId" integer NOT NULL,
    "suggestionId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.community_suggestion_votes OWNER TO prestij_user;

--
-- Name: community_suggestions; Type: TABLE; Schema: public; Owner: prestij_user
--

CREATE TABLE public.community_suggestions (
    id integer NOT NULL,
    "gameTitle" text NOT NULL,
    "steamUrl" text NOT NULL,
    "submittedById" integer NOT NULL,
    status public."SuggestionStatus" DEFAULT 'ACTIVE'::public."SuggestionStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.community_suggestions OWNER TO prestij_user;

--
-- Name: community_suggestions_id_seq; Type: SEQUENCE; Schema: public; Owner: prestij_user
--

CREATE SEQUENCE public.community_suggestions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.community_suggestions_id_seq OWNER TO prestij_user;

--
-- Name: community_suggestions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prestij_user
--

ALTER SEQUENCE public.community_suggestions_id_seq OWNED BY public.community_suggestions.id;


--
-- Name: download_logs; Type: TABLE; Schema: public; Owner: prestij_user
--

CREATE TABLE public.download_logs (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "projectId" integer NOT NULL,
    "downloadedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "ipAddress" text
);


ALTER TABLE public.download_logs OWNER TO prestij_user;

--
-- Name: download_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: prestij_user
--

CREATE SEQUENCE public.download_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.download_logs_id_seq OWNER TO prestij_user;

--
-- Name: download_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prestij_user
--

ALTER SEQUENCE public.download_logs_id_seq OWNED BY public.download_logs.id;


--
-- Name: dubbing_artist_favorites; Type: TABLE; Schema: public; Owner: prestij_user
--

CREATE TABLE public.dubbing_artist_favorites (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "artistId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.dubbing_artist_favorites OWNER TO prestij_user;

--
-- Name: dubbing_artist_favorites_id_seq; Type: SEQUENCE; Schema: public; Owner: prestij_user
--

CREATE SEQUENCE public.dubbing_artist_favorites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.dubbing_artist_favorites_id_seq OWNER TO prestij_user;

--
-- Name: dubbing_artist_favorites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prestij_user
--

ALTER SEQUENCE public.dubbing_artist_favorites_id_seq OWNED BY public.dubbing_artist_favorites.id;


--
-- Name: dubbing_artist_likes; Type: TABLE; Schema: public; Owner: prestij_user
--

CREATE TABLE public.dubbing_artist_likes (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "artistId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.dubbing_artist_likes OWNER TO prestij_user;

--
-- Name: dubbing_artist_likes_id_seq; Type: SEQUENCE; Schema: public; Owner: prestij_user
--

CREATE SEQUENCE public.dubbing_artist_likes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.dubbing_artist_likes_id_seq OWNER TO prestij_user;

--
-- Name: dubbing_artist_likes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prestij_user
--

ALTER SEQUENCE public.dubbing_artist_likes_id_seq OWNED BY public.dubbing_artist_likes.id;


--
-- Name: dubbing_artists; Type: TABLE; Schema: public; Owner: prestij_user
--

CREATE TABLE public.dubbing_artists (
    id integer NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    slug text,
    bio text,
    "imagePublicId" text,
    "siteRole" text,
    "websiteUrl" text,
    "twitterUrl" text,
    "instagramUrl" text,
    "youtubeUrl" text,
    "linkedinUrl" text,
    "githubUrl" text,
    "donationLink" text,
    "isTeamMember" boolean DEFAULT false NOT NULL,
    "teamOrder" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "likeCount" integer DEFAULT 0 NOT NULL,
    "favoriteCount" integer DEFAULT 0 NOT NULL,
    "userId" integer
);


ALTER TABLE public.dubbing_artists OWNER TO prestij_user;

--
-- Name: dubbing_artists_id_seq; Type: SEQUENCE; Schema: public; Owner: prestij_user
--

CREATE SEQUENCE public.dubbing_artists_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.dubbing_artists_id_seq OWNER TO prestij_user;

--
-- Name: dubbing_artists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prestij_user
--

ALTER SEQUENCE public.dubbing_artists_id_seq OWNED BY public.dubbing_artists.id;


--
-- Name: email_change_requests; Type: TABLE; Schema: public; Owner: prestij_user
--

CREATE TABLE public.email_change_requests (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "newEmail" text NOT NULL,
    token text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.email_change_requests OWNER TO prestij_user;

--
-- Name: email_change_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: prestij_user
--

CREATE SEQUENCE public.email_change_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.email_change_requests_id_seq OWNER TO prestij_user;

--
-- Name: email_change_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prestij_user
--

ALTER SEQUENCE public.email_change_requests_id_seq OWNED BY public.email_change_requests.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: prestij_user
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    content text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "senderId" integer NOT NULL,
    "receiverId" integer NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.messages OWNER TO prestij_user;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: prestij_user
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.messages_id_seq OWNER TO prestij_user;

--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prestij_user
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: prestij_user
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    message text NOT NULL,
    link text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notifications OWNER TO prestij_user;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: prestij_user
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.notifications_id_seq OWNER TO prestij_user;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prestij_user
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: project_assignments; Type: TABLE; Schema: public; Owner: prestij_user
--

CREATE TABLE public.project_assignments (
    id integer NOT NULL,
    "assignedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    role public."RoleInProject" NOT NULL,
    "projectId" integer NOT NULL,
    "artistId" integer NOT NULL
);


ALTER TABLE public.project_assignments OWNER TO prestij_user;

--
-- Name: project_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: prestij_user
--

CREATE SEQUENCE public.project_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.project_assignments_id_seq OWNER TO prestij_user;

--
-- Name: project_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prestij_user
--

ALTER SEQUENCE public.project_assignments_id_seq OWNED BY public.project_assignments.id;


--
-- Name: project_categories; Type: TABLE; Schema: public; Owner: prestij_user
--

CREATE TABLE public.project_categories (
    "projectId" integer NOT NULL,
    "categoryId" integer NOT NULL,
    "assignedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "assignedBy" text
);


ALTER TABLE public.project_categories OWNER TO prestij_user;

--
-- Name: project_characters; Type: TABLE; Schema: public; Owner: prestij_user
--

CREATE TABLE public.project_characters (
    id integer NOT NULL,
    "projectId" integer NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isVolunteerNeeded" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.project_characters OWNER TO prestij_user;

--
-- Name: project_characters_id_seq; Type: SEQUENCE; Schema: public; Owner: prestij_user
--

CREATE SEQUENCE public.project_characters_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.project_characters_id_seq OWNER TO prestij_user;

--
-- Name: project_characters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prestij_user
--

ALTER SEQUENCE public.project_characters_id_seq OWNED BY public.project_characters.id;


--
-- Name: project_dislikes; Type: TABLE; Schema: public; Owner: prestij_user
--

CREATE TABLE public.project_dislikes (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "projectId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.project_dislikes OWNER TO prestij_user;

--
-- Name: project_dislikes_id_seq; Type: SEQUENCE; Schema: public; Owner: prestij_user
--

CREATE SEQUENCE public.project_dislikes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.project_dislikes_id_seq OWNER TO prestij_user;

--
-- Name: project_dislikes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prestij_user
--

ALTER SEQUENCE public.project_dislikes_id_seq OWNED BY public.project_dislikes.id;


--
-- Name: project_favorites; Type: TABLE; Schema: public; Owner: prestij_user
--

CREATE TABLE public.project_favorites (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "projectId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.project_favorites OWNER TO prestij_user;

--
-- Name: project_favorites_id_seq; Type: SEQUENCE; Schema: public; Owner: prestij_user
--

CREATE SEQUENCE public.project_favorites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.project_favorites_id_seq OWNER TO prestij_user;

--
-- Name: project_favorites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prestij_user
--

ALTER SEQUENCE public.project_favorites_id_seq OWNED BY public.project_favorites.id;


--
-- Name: project_images; Type: TABLE; Schema: public; Owner: prestij_user
--

CREATE TABLE public.project_images (
    id integer NOT NULL,
    "projectId" integer NOT NULL,
    "publicId" text NOT NULL,
    caption text,
    "order" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.project_images OWNER TO prestij_user;

--
-- Name: project_images_id_seq; Type: SEQUENCE; Schema: public; Owner: prestij_user
--

CREATE SEQUENCE public.project_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.project_images_id_seq OWNER TO prestij_user;

--
-- Name: project_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prestij_user
--

ALTER SEQUENCE public.project_images_id_seq OWNED BY public.project_images.id;


--
-- Name: project_likes; Type: TABLE; Schema: public; Owner: prestij_user
--

CREATE TABLE public.project_likes (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "projectId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.project_likes OWNER TO prestij_user;

--
-- Name: project_likes_id_seq; Type: SEQUENCE; Schema: public; Owner: prestij_user
--

CREATE SEQUENCE public.project_likes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.project_likes_id_seq OWNER TO prestij_user;

--
-- Name: project_likes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prestij_user
--

ALTER SEQUENCE public.project_likes_id_seq OWNED BY public.project_likes.id;


--
-- Name: project_ratings; Type: TABLE; Schema: public; Owner: prestij_user
--

CREATE TABLE public.project_ratings (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "projectId" integer NOT NULL,
    value integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.project_ratings OWNER TO prestij_user;

--
-- Name: project_ratings_id_seq; Type: SEQUENCE; Schema: public; Owner: prestij_user
--

CREATE SEQUENCE public.project_ratings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.project_ratings_id_seq OWNER TO prestij_user;

--
-- Name: project_ratings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prestij_user
--

ALTER SEQUENCE public.project_ratings_id_seq OWNED BY public.project_ratings.id;


--
-- Name: projects; Type: TABLE; Schema: public; Owner: prestij_user
--

CREATE TABLE public.projects (
    id integer NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    type text NOT NULL,
    description text,
    "coverImagePublicId" text,
    "bannerImagePublicId" text,
    "externalWatchUrl" text,
    "releaseDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP,
    "isPublished" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "viewCount" integer DEFAULT 0 NOT NULL,
    "likeCount" integer DEFAULT 0 NOT NULL,
    "dislikeCount" integer DEFAULT 0 NOT NULL,
    "favoriteCount" integer DEFAULT 0 NOT NULL,
    "averageRating" double precision DEFAULT 0 NOT NULL,
    "ratingCount" integer DEFAULT 0 NOT NULL,
    "trailerUrl" text,
    price double precision,
    currency text DEFAULT 'TRY'::text,
    "isFeaturedForCountdown" boolean DEFAULT false NOT NULL,
    "progressPercentage" integer
);


ALTER TABLE public.projects OWNER TO prestij_user;

--
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: prestij_user
--

CREATE SEQUENCE public.projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.projects_id_seq OWNER TO prestij_user;

--
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prestij_user
--

ALTER SEQUENCE public.projects_id_seq OWNED BY public.projects.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: prestij_user
--

CREATE TABLE public.sessions (
    id integer NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" integer NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO prestij_user;

--
-- Name: sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: prestij_user
--

CREATE SEQUENCE public.sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sessions_id_seq OWNER TO prestij_user;

--
-- Name: sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prestij_user
--

ALTER SEQUENCE public.sessions_id_seq OWNED BY public.sessions.id;


--
-- Name: support_requests; Type: TABLE; Schema: public; Owner: prestij_user
--

CREATE TABLE public.support_requests (
    id integer NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    amount double precision,
    status text DEFAULT 'pending'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" integer NOT NULL
);


ALTER TABLE public.support_requests OWNER TO prestij_user;

--
-- Name: support_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: prestij_user
--

CREATE SEQUENCE public.support_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.support_requests_id_seq OWNER TO prestij_user;

--
-- Name: support_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prestij_user
--

ALTER SEQUENCE public.support_requests_id_seq OWNED BY public.support_requests.id;


--
-- Name: support_suggestions; Type: TABLE; Schema: public; Owner: prestij_user
--

CREATE TABLE public.support_suggestions (
    id integer NOT NULL,
    "gameTitle" text NOT NULL,
    "steamUrl" text,
    notes text,
    "userId" integer,
    "supporterName" text NOT NULL,
    "supportAmount" double precision NOT NULL,
    "paymentProvider" text NOT NULL,
    "transactionId" text,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.support_suggestions OWNER TO prestij_user;

--
-- Name: support_suggestions_id_seq; Type: SEQUENCE; Schema: public; Owner: prestij_user
--

CREATE SEQUENCE public.support_suggestions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.support_suggestions_id_seq OWNER TO prestij_user;

--
-- Name: support_suggestions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prestij_user
--

ALTER SEQUENCE public.support_suggestions_id_seq OWNED BY public.support_suggestions.id;


--
-- Name: team_applications; Type: TABLE; Schema: public; Owner: prestij_user
--

CREATE TABLE public.team_applications (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "selectedRole" public."RoleInProject" NOT NULL,
    message text,
    status public."ApplicationStatus" DEFAULT 'PENDING'::public."ApplicationStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "detailsJson" text
);


ALTER TABLE public.team_applications OWNER TO prestij_user;

--
-- Name: team_applications_id_seq; Type: SEQUENCE; Schema: public; Owner: prestij_user
--

CREATE SEQUENCE public.team_applications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.team_applications_id_seq OWNER TO prestij_user;

--
-- Name: team_applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prestij_user
--

ALTER SEQUENCE public.team_applications_id_seq OWNED BY public.team_applications.id;


--
-- Name: user_blocks; Type: TABLE; Schema: public; Owner: prestij_user
--

CREATE TABLE public.user_blocks (
    "blockerId" integer NOT NULL,
    "blockingId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.user_blocks OWNER TO prestij_user;

--
-- Name: user_notifications; Type: TABLE; Schema: public; Owner: prestij_user
--

CREATE TABLE public.user_notifications (
    id integer NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "userId" integer NOT NULL,
    "notificationId" integer NOT NULL
);


ALTER TABLE public.user_notifications OWNER TO prestij_user;

--
-- Name: user_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: prestij_user
--

CREATE SEQUENCE public.user_notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_notifications_id_seq OWNER TO prestij_user;

--
-- Name: user_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prestij_user
--

ALTER SEQUENCE public.user_notifications_id_seq OWNED BY public.user_notifications.id;


--
-- Name: user_owned_games; Type: TABLE; Schema: public; Owner: prestij_user
--

CREATE TABLE public.user_owned_games (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "projectId" integer NOT NULL,
    "purchasedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "purchasePrice" double precision
);


ALTER TABLE public.user_owned_games OWNER TO prestij_user;

--
-- Name: user_owned_games_id_seq; Type: SEQUENCE; Schema: public; Owner: prestij_user
--

CREATE SEQUENCE public.user_owned_games_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_owned_games_id_seq OWNER TO prestij_user;

--
-- Name: user_owned_games_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prestij_user
--

ALTER SEQUENCE public.user_owned_games_id_seq OWNED BY public.user_owned_games.id;


--
-- Name: user_reports; Type: TABLE; Schema: public; Owner: prestij_user
--

CREATE TABLE public.user_reports (
    id integer NOT NULL,
    reason text NOT NULL,
    description text,
    "reporterId" integer NOT NULL,
    "reportedId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL
);


ALTER TABLE public.user_reports OWNER TO prestij_user;

--
-- Name: user_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: prestij_user
--

CREATE SEQUENCE public.user_reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_reports_id_seq OWNER TO prestij_user;

--
-- Name: user_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prestij_user
--

ALTER SEQUENCE public.user_reports_id_seq OWNED BY public.user_reports.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: prestij_user
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email text NOT NULL,
    username text NOT NULL,
    "firstName" text,
    "lastName" text,
    password text,
    role public."UserRole" DEFAULT 'USER'::public."UserRole" NOT NULL,
    "profileImagePublicId" text,
    "bannerImagePublicId" text,
    bio text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isBanned" boolean DEFAULT false NOT NULL,
    "banExpiresAt" timestamp(3) without time zone,
    "banReason" text
);


ALTER TABLE public.users OWNER TO prestij_user;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: prestij_user
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO prestij_user;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prestij_user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: verification_tokens; Type: TABLE; Schema: public; Owner: prestij_user
--

CREATE TABLE public.verification_tokens (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.verification_tokens OWNER TO prestij_user;

--
-- Name: voice_assignments; Type: TABLE; Schema: public; Owner: prestij_user
--

CREATE TABLE public.voice_assignments (
    id integer NOT NULL,
    "projectAssignmentId" integer NOT NULL,
    "projectCharacterId" integer NOT NULL
);


ALTER TABLE public.voice_assignments OWNER TO prestij_user;

--
-- Name: voice_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: prestij_user
--

CREATE SEQUENCE public.voice_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.voice_assignments_id_seq OWNER TO prestij_user;

--
-- Name: voice_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prestij_user
--

ALTER SEQUENCE public.voice_assignments_id_seq OWNED BY public.voice_assignments.id;


--
-- Name: voice_submissions; Type: TABLE; Schema: public; Owner: prestij_user
--

CREATE TABLE public.voice_submissions (
    id integer NOT NULL,
    "dialogueId" integer NOT NULL,
    "userId" integer NOT NULL,
    "audioFilePublicId" text NOT NULL,
    notes text,
    status public."ApplicationStatus" DEFAULT 'PENDING'::public."ApplicationStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.voice_submissions OWNER TO prestij_user;

--
-- Name: voice_submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: prestij_user
--

CREATE SEQUENCE public.voice_submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.voice_submissions_id_seq OWNER TO prestij_user;

--
-- Name: voice_submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prestij_user
--

ALTER SEQUENCE public.voice_submissions_id_seq OWNED BY public.voice_submissions.id;


--
-- Name: accounts id; Type: DEFAULT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.accounts ALTER COLUMN id SET DEFAULT nextval('public.accounts_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: character_dialogues id; Type: DEFAULT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.character_dialogues ALTER COLUMN id SET DEFAULT nextval('public.character_dialogues_id_seq'::regclass);


--
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);


--
-- Name: community_suggestions id; Type: DEFAULT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.community_suggestions ALTER COLUMN id SET DEFAULT nextval('public.community_suggestions_id_seq'::regclass);


--
-- Name: download_logs id; Type: DEFAULT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.download_logs ALTER COLUMN id SET DEFAULT nextval('public.download_logs_id_seq'::regclass);


--
-- Name: dubbing_artist_favorites id; Type: DEFAULT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.dubbing_artist_favorites ALTER COLUMN id SET DEFAULT nextval('public.dubbing_artist_favorites_id_seq'::regclass);


--
-- Name: dubbing_artist_likes id; Type: DEFAULT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.dubbing_artist_likes ALTER COLUMN id SET DEFAULT nextval('public.dubbing_artist_likes_id_seq'::regclass);


--
-- Name: dubbing_artists id; Type: DEFAULT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.dubbing_artists ALTER COLUMN id SET DEFAULT nextval('public.dubbing_artists_id_seq'::regclass);


--
-- Name: email_change_requests id; Type: DEFAULT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.email_change_requests ALTER COLUMN id SET DEFAULT nextval('public.email_change_requests_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: project_assignments id; Type: DEFAULT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.project_assignments ALTER COLUMN id SET DEFAULT nextval('public.project_assignments_id_seq'::regclass);


--
-- Name: project_characters id; Type: DEFAULT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.project_characters ALTER COLUMN id SET DEFAULT nextval('public.project_characters_id_seq'::regclass);


--
-- Name: project_dislikes id; Type: DEFAULT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.project_dislikes ALTER COLUMN id SET DEFAULT nextval('public.project_dislikes_id_seq'::regclass);


--
-- Name: project_favorites id; Type: DEFAULT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.project_favorites ALTER COLUMN id SET DEFAULT nextval('public.project_favorites_id_seq'::regclass);


--
-- Name: project_images id; Type: DEFAULT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.project_images ALTER COLUMN id SET DEFAULT nextval('public.project_images_id_seq'::regclass);


--
-- Name: project_likes id; Type: DEFAULT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.project_likes ALTER COLUMN id SET DEFAULT nextval('public.project_likes_id_seq'::regclass);


--
-- Name: project_ratings id; Type: DEFAULT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.project_ratings ALTER COLUMN id SET DEFAULT nextval('public.project_ratings_id_seq'::regclass);


--
-- Name: projects id; Type: DEFAULT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.projects ALTER COLUMN id SET DEFAULT nextval('public.projects_id_seq'::regclass);


--
-- Name: sessions id; Type: DEFAULT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.sessions ALTER COLUMN id SET DEFAULT nextval('public.sessions_id_seq'::regclass);


--
-- Name: support_requests id; Type: DEFAULT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.support_requests ALTER COLUMN id SET DEFAULT nextval('public.support_requests_id_seq'::regclass);


--
-- Name: support_suggestions id; Type: DEFAULT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.support_suggestions ALTER COLUMN id SET DEFAULT nextval('public.support_suggestions_id_seq'::regclass);


--
-- Name: team_applications id; Type: DEFAULT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.team_applications ALTER COLUMN id SET DEFAULT nextval('public.team_applications_id_seq'::regclass);


--
-- Name: user_notifications id; Type: DEFAULT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.user_notifications ALTER COLUMN id SET DEFAULT nextval('public.user_notifications_id_seq'::regclass);


--
-- Name: user_owned_games id; Type: DEFAULT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.user_owned_games ALTER COLUMN id SET DEFAULT nextval('public.user_owned_games_id_seq'::regclass);


--
-- Name: user_reports id; Type: DEFAULT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.user_reports ALTER COLUMN id SET DEFAULT nextval('public.user_reports_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: voice_assignments id; Type: DEFAULT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.voice_assignments ALTER COLUMN id SET DEFAULT nextval('public.voice_assignments_id_seq'::regclass);


--
-- Name: voice_submissions id; Type: DEFAULT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.voice_submissions ALTER COLUMN id SET DEFAULT nextval('public.voice_submissions_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: prestij_user
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
da165f68-73c3-4e07-a5bd-c72e0186279c	26ac45bd72c44cadb2a9e5615a37d5825dfc862931cc13995cab00f6b3fb279a	2025-09-11 19:50:48.094334+00	20250909090710_init	\N	\N	2025-09-11 19:50:47.962539+00	1
cecd4d40-8f6a-42ef-8ed8-b8bd33daa29d	81c7758497af85cab7fa0386c10611ba49f3a57169a33f95135d8d2d38be18a6	2025-06-19 06:37:46.11938+00	20240101000000_init		\N	2025-06-19 06:37:46.11938+00	0
21830abd-803d-4ac5-a97b-51351d6cb6a6	c5b6ec8296b3b94ce5b372b2f282af31bcc326e585aa8b28a658d223934e34af	2025-06-19 06:45:14.626743+00	20250619064514_add_ban_and_auth_features	\N	\N	2025-06-19 06:45:14.504466+00	1
\.


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: prestij_user
--

COPY public.accounts (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: prestij_user
--

COPY public.categories (id, name, slug, "createdAt", "updatedAt") FROM stdin;
1	Aksiyon	aksiyon	2025-06-17 23:28:21.315	2025-06-17 23:28:21.315
2	Korku	korku	2025-06-17 23:28:30.257	2025-06-17 23:28:30.257
3	Komedi	komedi	2025-06-17 23:28:32.929	2025-06-17 23:28:32.929
4	Macera	macera	2025-06-17 23:29:29.387	2025-06-17 23:29:29.387
6	Simülasyon	simulasyon	2025-06-17 23:29:57.851	2025-06-17 23:29:57.851
7	Oynaması Ücretsiz	oynamasi-ucretsiz	2025-06-17 23:30:17.322	2025-06-17 23:30:19.913
8	Sevimli	sevimli	2025-06-17 23:30:31.959	2025-06-17 23:30:31.959
9	Pixel	pixel	2025-06-17 23:30:55.564	2025-06-17 23:30:55.564
10	Bilim Kurgu	bilim-kurgu	2025-06-17 23:31:21.264	2025-06-17 23:31:21.264
11	Yarış	yaris	2025-06-17 23:31:31.047	2025-06-17 23:31:31.047
12	Gizem	gizem	2025-06-17 23:31:44.71	2025-06-17 23:31:44.71
13	Polisiye	polisiye	2025-06-17 23:31:49.242	2025-06-17 23:31:49.242
14	Görsel Roman	gorsel-roman	2025-06-17 23:32:06.361	2025-06-17 23:32:06.361
15	Bulmaca	bulmaca	2025-06-17 23:33:22.415	2025-06-17 23:33:22.415
16	Birinci Şahıs	birinci-sahis	2025-06-17 23:33:46.728	2025-06-17 23:33:46.728
\.


--
-- Data for Name: character_dialogues; Type: TABLE DATA; Schema: public; Owner: prestij_user
--

COPY public.character_dialogues (id, "characterId", "dialogueText", "originalVoiceUrl", "createdAt") FROM stdin;
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: prestij_user
--

COPY public.comments (id, content, "createdAt", "updatedAt", "userId", "projectId") FROM stdin;
2	Harika!	2025-06-02 19:23:53.687	2025-06-02 19:23:53.687	3	11
3	Çok güzel	2025-06-12 07:45:33.319	2025-06-12 07:45:33.319	3	9
4	Ellerinize sağluk	2025-06-17 12:49:05.505	2025-06-17 12:49:05.505	16	8
5	50 fazla 49.90 yapın\n	2025-06-17 12:58:01.034	2025-06-17 12:58:01.034	16	13
6	MrGodzillaya 200 lira yapın	2025-06-18 10:39:21.836	2025-06-18 10:39:21.836	8	13
7	oha çok güzell\n	2025-06-18 10:43:49.809	2025-06-18 10:43:49.809	2	12
8	harika!	2025-06-19 06:49:31.599	2025-06-19 06:49:31.599	3	13
9	Kakadi	2025-08-06 22:06:45.438	2025-08-06 22:06:45.438	27	13
\.


--
-- Data for Name: community_suggestion_votes; Type: TABLE DATA; Schema: public; Owner: prestij_user
--

COPY public.community_suggestion_votes ("userId", "suggestionId", "createdAt") FROM stdin;
\.


--
-- Data for Name: community_suggestions; Type: TABLE DATA; Schema: public; Owner: prestij_user
--

COPY public.community_suggestions (id, "gameTitle", "steamUrl", "submittedById", status, "createdAt") FROM stdin;
\.


--
-- Data for Name: download_logs; Type: TABLE DATA; Schema: public; Owner: prestij_user
--

COPY public.download_logs (id, "userId", "projectId", "downloadedAt", "ipAddress") FROM stdin;
\.


--
-- Data for Name: dubbing_artist_favorites; Type: TABLE DATA; Schema: public; Owner: prestij_user
--

COPY public.dubbing_artist_favorites (id, "userId", "artistId", "createdAt") FROM stdin;
8	7	14	2025-06-02 20:12:56.938
9	7	9	2025-06-02 20:13:01.606
10	8	9	2025-06-08 22:28:36.572
12	10	9	2025-06-08 22:31:53.935
13	8	25	2025-06-08 22:31:55.767
14	8	56	2025-06-08 22:32:02.044
15	10	56	2025-06-08 22:32:02.902
16	11	11	2025-06-09 00:29:56.476
17	8	14	2025-06-09 15:20:05.085
23	3	14	2025-06-16 18:51:40.107
24	16	14	2025-06-17 12:49:41.166
26	3	25	2025-07-13 19:17:14.292
27	3	56	2025-07-31 00:28:35.525
28	8	69	2025-08-02 13:57:30.07
29	25	70	2025-08-03 16:58:29.759
32	28	9	2025-08-06 22:03:53.255
33	27	14	2025-08-06 22:04:14.347
34	28	13	2025-08-06 22:05:00.181
35	27	9	2025-08-06 22:08:22.144
36	16	60	2025-08-20 17:37:54.481
37	3	19	2025-08-23 18:33:57.735
38	3	12	2025-08-23 18:34:05.665
39	3	9	2025-08-23 18:34:28.337
40	12	14	2025-08-30 22:18:29.161
41	2	72	2025-08-30 22:26:31.244
43	29	72	2025-09-01 11:31:52.549
44	3	72	2025-09-01 14:04:30.714
45	8	17	2025-09-03 13:11:20.138
46	16	9	2025-09-03 20:26:20.828
47	2	73	2025-09-03 20:55:20.064
48	29	73	2025-09-03 21:28:11.381
49	10	25	2025-09-05 23:57:27.837
50	32	9	2025-09-07 19:23:11.008
\.


--
-- Data for Name: dubbing_artist_likes; Type: TABLE DATA; Schema: public; Owner: prestij_user
--

COPY public.dubbing_artist_likes (id, "userId", "artistId", "createdAt") FROM stdin;
6	7	14	2025-06-02 20:12:55.899
7	7	9	2025-06-02 20:13:01.042
9	8	9	2025-06-08 22:28:35.778
11	10	9	2025-06-08 22:31:53.45
12	8	25	2025-06-08 22:31:55.202
13	10	56	2025-06-08 22:32:02.353
14	8	56	2025-06-08 22:32:03.132
15	11	11	2025-06-09 00:00:39.266
16	8	14	2025-06-09 15:20:04.691
21	13	21	2025-06-12 09:44:33.596
23	15	9	2025-06-15 10:46:22.006
24	15	13	2025-06-15 10:46:38.279
25	16	14	2025-06-17 12:49:39.647
27	2	63	2025-07-20 18:45:08.144
28	2	64	2025-07-21 17:40:23.109
29	3	56	2025-07-31 00:28:34.986
37	8	66	2025-08-01 16:03:27.197
38	8	69	2025-08-02 13:57:29.673
40	25	70	2025-08-03 16:58:32.82
44	28	9	2025-08-06 22:03:52.714
45	27	14	2025-08-06 22:04:13.735
46	28	13	2025-08-06 22:04:58.018
47	27	9	2025-08-06 22:08:21.958
48	16	60	2025-08-20 17:37:53.845
49	3	19	2025-08-23 18:33:57.99
50	3	12	2025-08-23 18:34:06.444
51	3	9	2025-08-23 18:34:28.045
52	12	14	2025-08-30 22:18:28.861
53	3	14	2025-08-30 22:18:46.054
54	2	72	2025-08-30 22:26:30.94
56	29	72	2025-09-01 11:31:53.219
57	3	72	2025-09-01 14:04:30.969
58	8	17	2025-09-03 13:11:19.867
59	16	9	2025-09-03 20:26:20.196
60	2	73	2025-09-03 20:55:19.685
61	29	73	2025-09-03 21:28:11.083
62	10	25	2025-09-05 23:57:26.983
63	32	9	2025-09-07 19:23:09.762
\.


--
-- Data for Name: dubbing_artists; Type: TABLE DATA; Schema: public; Owner: prestij_user
--

COPY public.dubbing_artists (id, "firstName", "lastName", slug, bio, "imagePublicId", "siteRole", "websiteUrl", "twitterUrl", "instagramUrl", "youtubeUrl", "linkedinUrl", "githubUrl", "donationLink", "isTeamMember", "teamOrder", "createdAt", "updatedAt", "likeCount", "favoriteCount", "userId") FROM stdin;
20	Oruç	Çolak	\N	\N	artist_profiles/artistprofile_20_c25c9efbef44df9a2f530e2a489191e3_1748879529552	Seslendirme Sanatçısı	\N	\N	https://www.instagram.com/oruc.colak/	\N	\N	\N	\N	t	\N	2025-06-02 15:50:39.936	2025-06-02 15:53:32.169	0	0	\N
36	Erdem	Gören	\N	\N	artist_profiles/artistprofile_36_unnamed_1__1748892744313	\N	\N	\N	\N	https://www.youtube.com/@birlevelatladi	\N	\N	\N	f	\N	2025-06-02 17:14:48.445	2025-06-02 19:32:26.382	0	0	\N
37	İzzet	(THEASOSYAL)	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	2025-06-02 17:15:59.733	2025-06-02 17:15:59.733	0	0	\N
11	Şevval	Oğuz	\N	\N	artist_profiles/artistprofile_11__evval_o_uz_1748878672655	Seslendirme Sanatçısı	\N	\N	https://www.instagram.com/saqoare/	\N	\N	\N	\N	t	\N	2025-06-02 15:37:14.64	2025-06-09 00:29:56.482	1	1	\N
22	Akın	Alp	\N	\N	artist_profiles/artistprofile_22_37bc044c_831e_4db4_ad12_a7c5ff579882_1748879646128	Seslendirme Sanatçısı	\N	\N	https://www.instagram.com/mrak_exe/	\N	\N	\N	\N	t	\N	2025-06-02 15:53:32.172	2025-06-02 15:54:11.173	0	0	\N
18	Muhammet Enes	Durmuş	\N	\N	artist_profiles/artistprofile_18_muhammet_enes_durmu__1748879335816	Seslendirme Sanatçısı	\N	\N	https://www.instagram.com/ekstra.dublaj	\N	\N	\N	\N	t	\N	2025-06-02 15:47:57.325	2025-06-02 15:56:09.143	0	0	\N
23	Hülya	Türker	\N	\N	artist_profiles/artistprofile_23___1748879871870	Seslendirme Sanatçısı	\N	\N	https://www.instagram.com/musicandub/	\N	\N	\N	\N	t	\N	2025-06-02 15:55:21.528	2025-06-02 15:57:54.188	0	0	\N
30	Beşir	Tuna	\N	\N	artist_profiles/artistprofile_30_images_1__1748880771193	VFX	\N	\N	\N	\N	\N	\N	\N	t	\N	2025-06-02 16:11:32.373	2025-06-02 16:12:52.96	0	0	\N
15	İkra	İlker	\N	\N	artist_profiles/artistprofile_15_i_kra_i_lker_1748879048899	Seslendirme Sanatçısı	\N	\N	https://www.instagram.com/sparkle_dubb/	\N	\N	\N	\N	t	\N	2025-06-02 15:43:45.808	2025-06-02 15:44:10.946	0	0	\N
16	İrem Nur	Çorakay	\N	\N	artist_profiles/artistprofile_16_i_remnur_orakay_1748879158674	Seslendirme Sanatçısı	\N	\N	https://www.instagram.com/irmnr.crky	\N	\N	\N	\N	t	\N	2025-06-02 15:44:29.046	2025-06-02 15:46:01.567	0	0	\N
26	Ekin	Akdemir	\N	\N	artist_profiles/artistprofile_26_profile___olaf_1748880129374	Seslendirme Sanatçısı	\N	\N	https://www.instagram.com/ekinakdemirr/	\N	\N	\N	\N	t	\N	2025-06-02 16:01:38.22	2025-06-02 16:02:12.097	0	0	\N
32	Hira	Çakar	\N	\N	artist_profiles/artistprofile_32_c7d72621_f29e_46ef_8ad0_db77118de1a4_1748881256422	Seslendirme Sanatçısı	\N	\N	https://www.instagram.com/reichan_5081	\N	\N	\N	\N	t	\N	2025-06-02 16:19:11.571	2025-06-02 16:20:59.086	0	0	\N
47	Nutch	( Hangar Team )	\N	\N	artist_profiles/artistprofile_47_8aebfb003c8d0448854b7ca370d28a62_1748893238462	\N	https://www.hangarceviri.com/	\N	\N	\N	\N	\N	\N	f	\N	2025-06-02 18:04:51.459	2025-06-02 19:40:57.571	0	0	\N
28	Hümeyra	Koç	\N	\N	artist_profiles/artistprofile_28_hd_wallpaper_chainsaw_man_chainsawman_an_1748880505425	Seslendirme Sanatçısı	\N	\N	https://www.instagram.com/mitsuki_koge?igsh=MWVzenc3azA1eWYzMw%3D%3D	\N	\N	\N	\N	t	\N	2025-06-02 16:06:52.813	2025-06-02 16:08:27.919	0	0	\N
38	Ece	Coşkun	\N	\N	\N	\N	\N	\N	https://www.instagram.com/diannymooniel/	\N	\N	\N	\N	f	\N	2025-06-02 17:28:35.549	2025-06-02 17:28:57.742	0	0	\N
39	Toprakhan	Çakır	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	2025-06-02 17:29:14.755	2025-06-02 17:29:14.755	0	0	\N
52	Bay Kürek	(THEASOSYAL)	\N	\N	artist_profiles/artistprofile_52_channels4_profile_1748892919371	\N	\N	\N	\N	https://www.youtube.com/@BayKurekValorant	\N	\N	\N	f	\N	2025-06-02 18:21:38.542	2025-06-02 19:35:20.891	0	0	\N
42	Blaze	(THEASOSYAL)	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	2025-06-02 17:37:59.269	2025-06-02 17:37:59.269	0	0	\N
44	Mustafa Enes	Özkan	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	2025-06-02 18:01:22.032	2025-06-02 18:01:22.032	0	0	\N
45	Beril	Önal	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	2025-06-02 18:01:40.695	2025-06-02 18:01:40.695	0	0	\N
46	Cengiz	Bilgen	\N	\N	artist_profiles/artistprofile_46_ekran_g_r_nt_s_2025_06_02_210342_1748887460063	\N	\N	\N	https://www.instagram.com/cengiz.bilgen/	\N	\N	\N	\N	t	\N	2025-06-02 18:03:54.006	2025-06-02 18:04:22.434	0	0	\N
50	Rümeysa	(THEASOSYAL)	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	2025-06-02 18:13:39.525	2025-06-02 18:13:39.525	0	0	\N
51	Deniz Ay	Mika	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	2025-06-02 18:15:02.273	2025-06-02 18:15:02.273	0	0	\N
33	Zaur	Əbdürrəhimov	\N	\N	artist_profiles/artistprofile_33_1748895016575_1748895067394	\N	\N	\N	\N	https://www.youtube.com/channel/UCXDsMHZarlDLtCCQCavankA	\N	\N	\N	f	\N	2025-06-02 16:25:33.382	2025-06-02 20:11:09.023	0	0	\N
49	Meltem Saatçı	( Hangar Team )	\N	\N	\N	\N	https://www.hangarceviri.com/	\N	\N	\N	\N	\N	\N	f	\N	2025-06-02 18:05:30.078	2025-06-02 19:41:10.981	0	0	\N
48	Ayşenur Özdemir	( Hangar Team )	\N	\N	artist_profiles/artistprofile_48_ekran_g_r_nt_s_2025_06_02_223901_1748893169847	\N	https://www.hangarceviri.com/	\N	\N	\N	\N	\N	\N	f	\N	2025-06-02 18:05:09.855	2025-06-02 19:41:19.841	0	0	\N
53	Eren	Turkiş	\N	\N	artist_profiles/artistprofile_53_png_clipart_ichigo_kurosaki_zangetsu_bya_1748894652817	Seslendirme Sanatçısı	\N	\N	https://www.instagram.com/depresif888	\N	\N	\N	\N	t	\N	2025-06-02 20:00:22.962	2025-06-02 20:04:15.489	0	0	\N
24	Eren Can	Demirel	\N	\N	artist_profiles/artistprofile_24_whatsapp_image_2025_06_02_at_18_57_02_1748879970169	Seslendirme Sanatçısı	\N	\N	https://www.instagram.com/guy_with_a_motorcycle_helmet?igsh=MXMwb3dhejhkeGVxZg==	\N	\N	\N	\N	t	\N	2025-06-02 15:58:15.985	2025-08-04 16:27:13.85	0	0	\N
29	Tunahan	Taşlı	\N	\N	artist_profiles/artistprofile_29_file_1__1748880606920	Seslendirme Sanatçısı	\N	\N	https://www.instagram.com/gokustarr?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==	\N	\N	\N	\N	t	\N	2025-06-02 16:09:58.055	2025-07-17 15:07:31.57	0	0	\N
27	Kadir	Şenöz	\N	\N	artist_profiles/artistprofile_27_491873897_3064883303661646_2937830518197_1748880340329	Seslendirme Sanatçısı	\N	\N	https://www.instagram.com/justkagiro/	\N	\N	\N	\N	f	\N	2025-06-02 16:05:03.455	2025-07-22 18:57:21.669	0	0	\N
43	Begüm	Can	\N	\N	\N	Seslendirme Sanatçısı,Çevirmen	\N	\N	\N	\N	\N	\N	\N	t	\N	2025-06-02 18:01:06.009	2025-07-27 20:38:10.605	0	0	\N
41	Zeren	Dursun	zeren	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	2025-06-02 17:32:26.953	2025-08-31 21:39:21.404	0	0	\N
56	Mehmet Eren	Kıvrak	\N	\N	artist_profiles/artistprofile_56_mehmet_eren_k_vrak_1749421573804	Çevirmen , Mod Geliştiricisi,Kod Yazarı	\N	\N	https://www.instagram.com/mehmeteren_0/	https://www.youtube.com/@mehmeterenkvrak8081/videos	\N	\N	\N	t	1	2025-06-08 22:19:20.636	2025-09-05 23:57:05.56	3	3	\N
40	Arda Ediz	Güzey	\N	\N	artist_profiles/artistprofile_40_ekran_g_r_nt_s_2025_06_02_223041_1748892666629	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	2025-06-02 17:29:46.56	2025-07-31 11:47:20.381	0	0	\N
13	Ömer Yiğit	Arslan	\N	\N	artist_profiles/artistprofile_13__mer_yi_it_arslan_1748878879465	Seslendirme Sanatçısı	\N	\N	https://www.instagram.com/aizendub/	\N	\N	\N	\N	f	\N	2025-06-02 15:40:57.254	2025-08-08 15:24:45.817	2	1	\N
12	Efe	Coşkun	\N	\N	artist_profiles/artistprofile_12_whatsapp_image_2025_06_02_at_18_37_30_1748878753169	Kurucu, Seslendirme Sanatçısı	\N	\N	https://www.instagram.com/kanges.dub/	\N	\N	\N	\N	t	0	2025-06-02 15:38:14.241	2025-08-23 18:34:06.446	1	1	\N
21	Seda	Dilki	\N	\N	artist_profiles/artistprofile_21_3bc73288_5902_4a27_b386_270469cd1d8f_1748879585892	Seslendirme Sanatçısı	\N	\N	https://www.instagram.com/seda.dilki/	\N	\N	\N	\N	f	\N	2025-06-02 15:52:28.114	2025-08-30 22:27:32.529	1	0	\N
19	Elif Azra	Erdoğan	\N	\N	artist_profiles/artistprofile_19_whatsapp_image_2025_06_01_at_18_22_24_1748879398512	Seslendirme Sanatçısı	\N	\N	https://www.instagram.com/erifudublaj/	\N	\N	\N	\N	t	\N	2025-06-02 15:49:34.77	2025-08-23 18:33:57.992	1	1	\N
25	Eren	Gözel	\N	\N	artist_profiles/artistprofile_25_490581347_3327253297416620_6173054235891_1748880041852	Seslendirme Sanatçısı	\N	\N	https://www.instagram.com/meliodas_dub/	\N	\N	\N	\N	t	\N	2025-06-02 16:00:17.499	2025-09-05 23:57:27.839	2	3	\N
17	İrem	Çötür	\N	\N	artist_profiles/artistprofile_17_whatsapp_g_rsel_2025_08_28_saat_13_20_35_1756905060127	Seslendirme Sanatçısı	\N	\N	https://www.instagram.com/iremmm_ctr/	\N	\N	\N	\N	t	\N	2025-06-02 15:46:29.95	2025-09-03 13:11:20.141	1	1	\N
58	Arda	‎	\N	\N	artist_profiles/artistprofile_58_686cdb8f_6cb8_47b7_b719_af9762a5db18_1749497575803	Çevirmen	\N	\N	\N	https://www.youtube.com/@Thrian	\N	\N	\N	t	\N	2025-06-09 19:28:03.076	2025-06-09 19:33:45.364	0	0	\N
66	Selen	Turhan	selen-tura	\N	artist_profiles/artistprofile_66_selen_1753650216915	Seslendirme Sanatçısı,Mix/Mastering,Vokalist	\N	\N	https://www.instagram.com/ravensdublaj?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==	\N	\N	\N	\N	f	\N	2025-07-27 20:53:11.791	2025-08-26 18:19:20.189	1	0	\N
61	Sanem	Süre	\N	\N	artist_profiles/artistprofile_61_whatsapp_image_2025_07_17_at_19_59_15_ce_1752771608646	Seslendirme Sanatçısı	\N	\N	https://www.instagram.com/caciksevendublaj_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==	\N	\N	\N	\N	t	\N	2025-07-17 16:58:09.517	2025-07-17 17:00:42.002	0	0	\N
62	Eftelya	Orhunbilge	\N	\N	\N	Seslendirmen Sanatçısı	\N	\N	\N	\N	\N	\N	\N	f	\N	2025-07-20 17:37:58.276	2025-07-20 17:40:12.038	0	0	\N
69	Talya	Gürçavdı	\N	\N	artist_profiles/artistprofile_69_snapchat_1317332913_1754143004173	Çevirmen	\N	\N	https://www.instagram.com/meiling.mingyue/	\N	\N	\N	\N	t	\N	2025-08-02 13:55:02.379	2025-08-02 13:57:30.073	1	1	\N
63	Hamza	Sevgili	\N	\N	artist_profiles/artistprofile_63_whatsapp_gorsel_2025_07_20_saat_21_43_57_1753037091227	Seslendirmen Sanatçısı	\N	\N	https://www.instagram.com/hamzasevgl	\N	\N	\N	\N	t	\N	2025-07-20 18:43:03.548	2025-07-20 18:45:08.155	1	0	\N
64	Aysu	Perçim	\N	\N	artist_profiles/artistprofile_64_file_1753119598180	Seslendirmen Sanatçısı	\N	\N	https://www.instagram.com/dublajays?igsh=bDgybTVobm1lZmY1	\N	\N	\N	\N	t	\N	2025-07-21 17:38:12.874	2025-07-21 17:40:23.119	1	0	\N
65	Muhammet	Nayci	\N	\N	artist_profiles/artistprofile_65_snapchat_673009927_1753632090588	Seslendirme Sanatçısı	\N	\N	https://www.instagram.com/mlbb_kurumi?igsh=MTc3cjdiZ2p4cjgxag==	\N	\N	\N	\N	t	\N	2025-07-27 15:56:29.558	2025-07-27 16:01:33.863	0	0	\N
72	Pınar Ece	Soyalan	\N	\N	artist_profiles/artistprofile_72_whatsapp_gorsel_2025_08_31_saat_01_19_07_1756592769997	Seslendirme Sanatçısı	\N	\N	https://www.instagram.com/nottverena/	\N	\N	\N	\N	t	\N	2025-08-30 22:24:54.353	2025-09-01 14:04:30.971	3	3	\N
14	Emre	Bulut	\N	\N	artist_profiles/artistprofile_14_ekran_g_r_nt_s_2025_07_31_033350_1753922046709	Yazılımcı, Seslendirme Sanatçısı, Mod Geliştiricisi,  SFX/VFX	https://guns.lol/chimiya	\N	https://www.instagram.com/005emreebulutt005/	https://www.youtube.com/@chimi_ya	\N	\N	https://youtu.be/gQIH-pgzQSY?t=96	t	0	2025-06-02 15:41:55.605	2025-08-30 22:18:46.057	6	6	\N
70	Ferhat	Nurkan	\N	\N	artist_profiles/artistprofile_70_62e2947e07aea7a8655395dfc49af47d_1_1754168490883	Çevirmen	\N	\N	https://www.instagram.com/mr.renn0/	\N	\N	\N	\N	t	\N	2025-08-02 20:48:20.1	2025-08-03 16:58:32.822	1	1	\N
71	Seher	Süzer	\N	\N	artist_profiles/artistprofile_71_seher_1754586378349	Seslendirme Sanatçısı	\N	\N	https://www.instagram.com/sheirll__?igsh=MTZ5MWtxa2s4dWVhcw==	\N	\N	\N	\N	t	\N	2025-08-07 17:05:21.466	2025-08-07 18:10:52.064	0	0	\N
54	Hilal	Karayiğit	\N	\N	artist_profiles/artistprofile_54_whatsapp_g_rsel_2025_06_08_saat_21_37_38_1749408309973	Seslendirme Sanatçısı	\N	\N	https://www.instagram.com/tsukishuii/	\N	\N	\N	\N	t	\N	2025-06-08 18:09:07.41	2025-08-06 16:18:14.243	0	0	\N
60	Yusuf İslam	Aksoy	\N	\N	artist_profiles/artistprofile_60_adsz_tasarm_1752767369197	Seslendirme Sanatçısı	\N	\N	https://www.instagram.com/mr_godzilla_dub?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==	\N	\N	\N	\N	t	\N	2025-07-17 14:53:40.16	2025-08-20 17:37:54.485	1	1	\N
67	Enise	Osmanoğlu	\N	\N	artist_profiles/artistprofile_67_enise_1754049490049	Seslendirme Sanatçısı	\N	\N	\N	\N	\N	\N	\N	f	\N	2025-08-01 11:53:49.624	2025-08-30 22:28:34.509	0	0	\N
73	Canan	Ağluç	\N	\N	artist_profiles/artistprofile_73_c6c55a10_4684_4c2e_915f_1756932896065	\N	\N	\N	http://instagram.com/aglucc	\N	\N	\N	\N	t	\N	2025-09-03 20:53:41.814	2025-09-03 21:28:11.383	2	2	\N
9	Rüzgar Orhan	Yozğat	\N	\N	artist_profiles/artistprofile_9_whatsapp_image_2025_05_27_at_13_16_31_1748878508768	Kurucu, Seslendirme Sanatçısı, Mod Geliştiricisi,  SFX/VFX	\N	\N	https://www.instagram.com/cantstophims/	https://www.youtube.com/@Prestij_Studio	\N	\N	\N	t	-1	2025-06-02 15:31:41.265	2025-09-07 19:23:11.009	9	8	\N
\.


--
-- Data for Name: email_change_requests; Type: TABLE DATA; Schema: public; Owner: prestij_user
--

COPY public.email_change_requests (id, "userId", "newEmail", token, "expiresAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: prestij_user
--

COPY public.messages (id, content, "createdAt", "senderId", "receiverId", "isRead") FROM stdin;
5	profil resminle bannerını yanlışlıkla sildim geri yüklersin bromm	2025-06-02 16:17:05.918	3	5	f
6	Slm	2025-06-02 19:54:12.27	3	6	f
7	Selam naber	2025-06-12 07:54:32.264	3	6	f
9	aleyküm selam	2025-06-17 12:59:53.787	16	3	t
10	site müp müp	2025-06-17 12:59:58.172	16	3	t
11	kaç kofrete verirsin	2025-06-17 13:00:05.761	16	3	t
13	bişi değil	2025-06-17 13:00:14.204	16	3	t
14	selam nabersin bea?	2025-06-19 06:50:07.372	12	3	t
15	iyidir aga senden naber	2025-06-19 06:50:16.903	3	12	t
16	adsadasgdsfgbs	2025-06-19 07:32:24.783	3	12	t
17	gsdgdsg	2025-06-19 07:32:27.142	3	12	t
18	asdad	2025-06-19 07:32:45.617	3	12	t
19	asdsadsa	2025-06-19 07:32:58.694	12	3	t
22	naber	2025-08-06 22:07:16.756	3	27	t
23	İyi senden naber	2025-08-06 22:07:28.903	27	3	t
25	Asosyal Pornhub atalım	2025-08-06 22:07:50.158	27	3	t
24	benden de ii	2025-08-06 22:07:48.972	3	27	t
26	oo chat ne diyor	2025-08-06 22:07:56.228	3	27	t
27	Taşşaklarını yiyeyim abi	2025-08-06 22:08:43.872	22	27	t
28	Ohaaa	2025-08-06 22:10:50.712	27	22	t
20	slm bebek	2025-08-01 16:04:58.203	3	8	t
21	samirana soraka olayım mı?	2025-08-01 16:05:42.759	3	8	t
29	olur aşkım	2025-08-08 15:22:07.285	8	3	t
30	Haloo	2025-08-17 13:27:08.742	3	29	t
8	selam huuhuu	2025-06-17 12:58:35.06	3	16	t
12	eyvallah yigenh	2025-06-17 13:00:08.593	3	16	t
31	muck	2025-08-17 13:57:20.42	16	3	t
33	🤷‍♂️	2025-08-17 16:01:10.354	3	16	t
32	sa	2025-08-17 14:23:47.179	16	29	t
34	sa	2025-08-17 16:02:50.816	16	29	t
35	naber bebek	2025-09-07 18:35:20.72	3	16	f
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: prestij_user
--

COPY public.notifications (id, message, link, "createdAt") FROM stdin;
1	Yeni bir proje yayınlandı: test	/projeler/test	2025-06-19 06:50:45.278
2	Yeni bir proje yayınlandı: Undertale Türkçe Dublaj Modu	/projeler/undertaledub	2025-07-17 17:08:57.529
3	Yeni bir proje yayınlandı: Among The Sleep Türkçe Dublaj	/projeler/atstrdub	2025-07-17 17:11:29.162
4	Yeni bir proje yayınlandı: Tomodachi Game	/projeler/tmdctr	2025-07-26 20:20:42.974
5	Yeni bir proje yayınlandı: Untill Dawn	/projeler/untildawntrdub	2025-08-28 21:06:33.327
6	Yönetimden Hediye: "Untill Dawn Türkçe Dublaj" dublajı artık kütüphanenizde!	/projeler/untildawntrdub	2025-09-11 20:07:12.808
7	Yönetimden Hediye: "Untill Dawn Türkçe Dublaj" dublajı artık kütüphanenizde!	/projeler/untildawntrdub	2025-09-11 20:07:49.855
\.


--
-- Data for Name: project_assignments; Type: TABLE DATA; Schema: public; Owner: prestij_user
--

COPY public.project_assignments (id, "assignedAt", role, "projectId", "artistId") FROM stdin;
324	2025-07-24 12:22:57.407	VOICE_ACTOR	10	22
325	2025-07-24 12:22:57.433	VOICE_ACTOR	10	46
326	2025-07-24 12:22:57.439	VOICE_ACTOR	10	50
327	2025-07-24 12:22:57.443	VOICE_ACTOR	10	51
328	2025-07-24 12:22:57.447	VOICE_ACTOR	10	14
329	2025-07-24 12:22:57.451	VOICE_ACTOR	10	16
330	2025-07-24 12:22:57.457	VOICE_ACTOR	10	9
331	2025-07-24 12:22:57.461	VOICE_ACTOR	10	27
332	2025-07-24 12:22:57.463	VOICE_ACTOR	10	15
333	2025-07-24 12:22:57.465	VOICE_ACTOR	10	45
334	2025-07-24 12:22:57.466	VOICE_ACTOR	10	42
335	2025-07-24 12:22:57.468	VOICE_ACTOR	10	39
336	2025-07-24 12:22:57.47	VOICE_ACTOR	10	13
337	2025-07-24 12:22:57.473	VOICE_ACTOR	10	52
338	2025-07-24 12:22:57.475	VOICE_ACTOR	10	40
339	2025-07-24 12:22:57.481	VOICE_ACTOR	10	21
340	2025-07-24 12:22:57.484	VOICE_ACTOR	10	43
341	2025-07-24 12:22:57.497	VOICE_ACTOR	10	12
342	2025-07-24 12:22:57.501	VOICE_ACTOR	10	36
343	2025-07-24 12:22:57.504	VOICE_ACTOR	10	38
344	2025-07-24 12:22:57.506	TRANSLATOR	10	47
345	2025-07-24 12:22:57.507	TRANSLATOR	10	48
346	2025-07-24 12:22:57.508	TRANSLATOR	10	49
347	2025-07-24 12:22:57.509	MODDER	10	14
348	2025-07-24 12:22:57.509	MIX_MASTER	10	14
349	2025-07-24 12:22:57.51	VOICE_ACTOR	10	33
350	2025-07-24 12:23:29.762	VOICE_ACTOR	12	19
351	2025-07-24 12:23:29.764	VOICE_ACTOR	12	9
352	2025-07-24 12:23:29.766	VOICE_ACTOR	12	13
353	2025-07-24 12:23:29.768	VOICE_ACTOR	12	17
354	2025-07-24 12:23:29.77	VOICE_ACTOR	12	26
355	2025-07-24 12:23:29.773	VOICE_ACTOR	12	12
356	2025-07-24 12:23:29.774	VOICE_ACTOR	12	14
357	2025-07-24 12:23:29.776	VOICE_ACTOR	12	11
358	2025-07-24 12:23:29.778	MIX_MASTER	12	14
359	2025-07-24 12:23:29.781	MODDER	12	14
360	2025-07-24 12:23:29.784	TRANSLATOR	12	14
361	2025-07-24 12:24:01.725	VOICE_ACTOR	11	44
362	2025-07-24 12:24:01.729	VOICE_ACTOR	11	14
363	2025-07-24 12:24:01.734	VOICE_ACTOR	11	43
364	2025-07-24 12:24:01.748	VOICE_ACTOR	11	42
365	2025-07-24 12:24:01.751	VOICE_ACTOR	11	9
366	2025-07-24 12:24:01.754	VOICE_ACTOR	11	45
367	2025-07-24 12:24:01.758	VOICE_ACTOR	11	13
368	2025-07-24 12:24:01.761	VOICE_ACTOR	11	40
369	2025-07-24 12:24:01.764	VOICE_ACTOR	11	39
370	2025-07-24 12:24:01.768	VOICE_ACTOR	11	12
371	2025-07-24 12:24:01.772	VOICE_ACTOR	11	29
372	2025-07-24 12:24:01.778	VOICE_ACTOR	11	20
373	2025-07-24 12:24:01.781	VOICE_ACTOR	11	46
374	2025-07-24 12:24:01.784	VOICE_ACTOR	11	21
375	2025-07-24 12:24:01.787	VOICE_ACTOR	11	25
376	2025-07-24 12:24:01.793	VOICE_ACTOR	11	36
377	2025-07-24 12:24:01.796	VOICE_ACTOR	11	38
378	2025-07-24 12:24:01.799	VOICE_ACTOR	11	16
379	2025-07-24 12:24:01.802	VOICE_ACTOR	11	22
380	2025-07-24 12:24:01.805	TRANSLATOR	11	47
381	2025-07-24 12:24:01.805	TRANSLATOR	11	49
382	2025-07-24 12:24:01.806	TRANSLATOR	11	48
383	2025-07-24 12:24:01.806	MIX_MASTER	11	14
384	2025-07-24 12:24:01.807	MODDER	11	14
385	2025-07-29 07:27:55.913	VOICE_ACTOR	8	37
386	2025-07-29 07:27:55.936	VOICE_ACTOR	8	14
387	2025-07-29 07:27:55.944	VOICE_ACTOR	8	29
388	2025-07-29 07:27:55.951	VOICE_ACTOR	8	15
389	2025-07-29 07:27:55.955	VOICE_ACTOR	8	36
390	2025-07-29 07:27:55.958	VOICE_ACTOR	8	13
391	2025-07-29 07:27:55.977	VOICE_ACTOR	8	27
392	2025-07-29 07:27:55.981	MIX_MASTER	8	14
393	2025-07-29 07:27:55.983	MODDER	8	14
394	2025-07-29 07:27:55.984	TRANSLATOR	8	14
395	2025-07-29 07:28:11.185	VOICE_ACTOR	9	38
396	2025-07-29 07:28:11.202	VOICE_ACTOR	9	40
397	2025-07-29 07:28:11.21	VOICE_ACTOR	9	12
398	2025-07-29 07:28:11.214	VOICE_ACTOR	9	36
399	2025-07-29 07:28:11.22	VOICE_ACTOR	9	42
400	2025-07-29 07:28:11.224	VOICE_ACTOR	9	16
401	2025-07-29 07:28:11.227	VOICE_ACTOR	9	20
402	2025-07-29 07:28:11.232	VOICE_ACTOR	9	13
403	2025-07-29 07:28:11.235	VOICE_ACTOR	9	9
404	2025-07-29 07:28:11.237	VOICE_ACTOR	9	39
405	2025-07-29 07:28:11.24	VOICE_ACTOR	9	41
406	2025-07-29 07:28:11.243	VOICE_ACTOR	9	14
407	2025-07-29 07:28:11.247	MIX_MASTER	9	14
408	2025-07-29 07:28:11.248	MODDER	9	14
409	2025-07-29 07:28:11.249	TRANSLATOR	9	14
\.


--
-- Data for Name: project_categories; Type: TABLE DATA; Schema: public; Owner: prestij_user
--

COPY public.project_categories ("projectId", "categoryId", "assignedAt", "assignedBy") FROM stdin;
22	1	2025-07-17 17:08:57.516	\N
22	14	2025-07-17 17:08:57.516	\N
22	4	2025-07-17 17:08:57.516	\N
8	1	2025-07-29 07:27:55.893	\N
8	7	2025-07-29 07:27:55.893	\N
8	15	2025-07-29 07:27:55.893	\N
8	16	2025-07-29 07:27:55.893	\N
8	2	2025-07-29 07:27:55.893	\N
25	15	2025-09-11 20:27:09.71	\N
25	12	2025-09-11 20:27:09.71	\N
25	10	2025-09-11 20:27:09.71	\N
25	2	2025-09-11 20:27:09.71	\N
25	1	2025-09-11 20:27:09.71	\N
\.


--
-- Data for Name: project_characters; Type: TABLE DATA; Schema: public; Owner: prestij_user
--

COPY public.project_characters (id, "projectId", name, "createdAt", "updatedAt", "isVolunteerNeeded") FROM stdin;
2	8	Leith Pierre	2025-06-02 17:09:41.33	2025-06-02 17:09:41.33	f
3	8	Poppy	2025-06-02 17:10:57.868	2025-06-02 17:10:57.868	f
4	8	Avery	2025-06-02 17:11:13.472	2025-06-02 17:11:13.472	f
5	8	Rich	2025-06-02 17:11:23.051	2025-06-02 17:11:23.051	f
7	8	Bilim Adamı	2025-06-02 17:12:45.952	2025-06-02 17:12:45.952	f
8	8	Sözcü	2025-06-02 17:13:25.503	2025-06-02 17:13:25.503	f
9	8	Görüşmeci	2025-06-02 17:13:38.085	2025-06-02 17:13:38.085	f
10	8	Kadın Anlatıcı	2025-06-02 17:13:56.643	2025-06-02 17:13:56.643	f
11	8	Stella Greyber	2025-06-02 17:14:31.816	2025-06-02 17:14:31.816	f
13	9	Hep Birlikte ( Reklam Şarkısı )	2025-06-02 17:25:09.674	2025-06-02 17:25:24.113	f
14	9	Anlatıcı	2025-06-02 17:26:01.781	2025-06-02 17:26:01.781	f
15	9	Marcas Brickley	2025-06-02 17:26:14.415	2025-06-02 17:26:14.415	f
16	9	Röportajcı	2025-06-02 17:26:22.981	2025-06-02 17:26:22.981	f
17	9	Jimmy Roth	2025-06-02 17:26:30.707	2025-06-02 17:26:41.594	f
18	9	Oyunların Anlatıcısı	2025-06-02 17:26:58.4	2025-06-02 17:26:58.4	f
19	9	PJ	2025-06-02 17:27:06.561	2025-06-02 17:27:06.561	f
20	9	Kissy	2025-06-02 17:27:14.166	2025-06-02 17:27:14.166	f
21	9	Daisy	2025-06-02 17:27:22.93	2025-06-02 17:27:22.93	f
22	9	Cat Bee	2025-06-02 17:27:29.033	2025-06-02 17:27:37.724	f
23	9	Candy Cat	2025-06-02 17:27:43.62	2025-06-02 17:27:43.62	f
24	9	Bunzo Bunny	2025-06-02 17:27:51.304	2025-06-02 17:27:51.304	f
25	9	Bron	2025-06-02 17:27:56.246	2025-06-02 17:27:56.246	f
26	9	BoogieBot	2025-06-02 17:28:06.976	2025-06-02 17:28:06.976	f
27	9	Uzun Bacaklı Annecik	2025-06-02 17:28:18.047	2025-06-02 17:28:18.047	f
28	9	Poppy	2025-06-02 17:33:58.974	2025-06-02 17:33:58.974	f
29	9	Stella Greyber	2025-06-02 17:35:09.936	2025-06-02 17:35:09.936	f
30	9	Spiker	2025-06-02 17:36:49.872	2025-06-02 17:36:49.872	f
31	9	Rich	2025-06-02 17:37:10.632	2025-06-02 17:37:10.632	f
32	9	Bilinmeyen Anlatıcı	2025-06-02 17:41:03.881	2025-06-02 17:41:03.881	f
33	9	Leith Pierre	2025-06-02 17:41:54.365	2025-06-02 17:41:54.365	f
34	9	Huggy Wuggy	2025-06-02 17:42:43.419	2025-06-02 17:42:43.419	f
35	10	Bay Hartmann	2025-06-02 18:05:50.184	2025-06-02 18:05:50.184	f
36	10	Bayan Brooks	2025-06-02 18:06:13.649	2025-06-02 18:06:13.649	f
37	10	Bayan Hartmann	2025-06-02 18:06:19.709	2025-06-02 18:06:19.709	f
38	10	Bilim Adamı	2025-06-02 18:06:24.415	2025-06-02 18:06:24.415	f
39	10	Bobby Bearhug	2025-06-02 18:06:44.185	2025-06-02 18:06:44.185	f
40	10	Bubba Bubbaphant	2025-06-02 18:07:12.122	2025-06-02 18:07:12.122	f
41	10	Catnap	2025-06-02 18:07:18.871	2025-06-02 18:07:18.871	f
42	10	Claire Harper	2025-06-02 18:07:25.634	2025-06-02 18:07:40.058	f
43	10	CraftyCorn	2025-06-02 18:07:47.198	2025-06-02 18:07:47.198	f
44	10	Çocuk 1	2025-06-02 18:07:59.562	2025-06-02 18:07:59.562	f
45	10	Çocuk 2	2025-06-02 18:08:03.657	2025-06-02 18:08:03.657	f
46	10	Danışman	2025-06-02 18:08:08.686	2025-06-02 18:08:08.686	f
47	10	DogDay	2025-06-02 18:08:15.321	2025-06-02 18:08:15.321	f
48	10	Dr. White	2025-06-02 18:08:26.145	2025-06-02 18:08:26.145	f
49	10	Elliot Ludwig	2025-06-02 18:08:34.338	2025-06-02 18:08:42.508	f
50	10	Haber Spikeri	2025-06-02 18:08:54.445	2025-06-02 18:08:54.445	f
51	10	Harley Sawyer	2025-06-02 18:09:05.536	2025-06-02 18:09:05.536	f
52	10	Hoppy Hoppyscotch	2025-06-02 18:09:35.724	2025-06-02 18:09:35.724	f
53	10	Huggy Wuggy	2025-06-02 18:09:42.385	2025-06-02 18:09:42.385	f
54	10	Joseph	2025-06-02 18:09:50.652	2025-06-02 18:09:50.652	f
55	10	Prototip	2025-06-02 18:09:56.651	2025-06-02 18:09:56.651	f
56	10	Radyodaki Adam	2025-06-02 18:10:03.383	2025-06-02 18:10:03.383	f
57	10	Rich	2025-06-02 18:10:06.709	2025-06-02 18:10:06.709	f
58	10	Spiker	2025-06-02 18:10:11.254	2025-06-02 18:10:11.254	f
59	10	Stella Greyber	2025-06-02 18:10:22.271	2025-06-02 18:10:22.271	f
60	10	Stuart	2025-06-02 18:10:32.757	2025-06-02 18:10:32.757	f
61	10	Unknown Kadın	2025-06-02 18:10:44.146	2025-06-02 18:10:44.146	f
62	10	Kadın Bilim İnsanı	2025-06-02 18:14:18.429	2025-06-02 18:14:18.429	f
63	10	Miss Delight	2025-06-02 18:15:42.677	2025-06-02 18:15:42.677	f
64	10	Picky Piggy	2025-06-02 18:17:20.194	2025-06-02 18:17:20.194	f
65	10	Sözcü	2025-06-02 18:18:26.35	2025-06-02 18:18:26.35	f
66	10	Kadın Anlatıcı	2025-06-02 18:19:11.188	2025-06-02 18:19:11.188	f
67	10	DogDay ( KARTON )	2025-06-02 18:20:28.646	2025-06-02 18:20:28.646	f
68	10	Kicken Chicken	2025-06-02 18:23:48.884	2025-06-02 18:23:48.884	f
69	10	Leith Pierre	2025-06-02 18:24:13.079	2025-06-02 18:24:23.813	f
70	10	Ollie	2025-06-02 18:25:05.305	2025-06-02 18:25:05.305	f
71	10	Poppy	2025-06-02 18:25:36.015	2025-06-02 18:25:36.015	f
72	11	Uzman 1	2025-06-02 18:30:28.018	2025-06-02 18:30:28.018	f
73	11	Uzman 2	2025-06-02 18:30:33.485	2025-06-02 18:30:33.485	f
75	11	Uzman 4	2025-06-02 18:30:44.351	2025-06-02 18:30:44.351	f
76	11	Uzman 5	2025-06-02 18:30:48.573	2025-06-02 18:30:48.573	f
77	11	CraftyCorn	2025-06-02 18:31:03.879	2025-06-02 18:31:03.879	f
78	11	Tur Rehberi	2025-06-02 18:31:09.507	2025-06-02 18:31:09.507	f
79	11	Medic	2025-06-02 18:31:15.625	2025-06-02 18:31:15.625	f
81	11	Bilim İnsanı 4	2025-06-02 18:31:29.796	2025-06-02 18:31:29.796	f
80	11	Bilim Insanı 3	2025-06-02 18:31:22.195	2025-06-02 18:31:37.689	f
74	11	Uzman 3	2025-06-02 18:30:40.662	2025-06-02 18:31:41.139	f
82	11	Huggy Wuggy	2025-06-02 18:31:48.878	2025-06-02 18:31:48.878	f
83	11	Doey	2025-06-02 18:31:52.664	2025-06-02 18:31:52.664	f
84	11	Bubba Bubbaphant	2025-06-02 18:32:14.088	2025-06-02 18:32:14.088	f
85	11	Warrenbach	2025-06-02 18:32:24.814	2025-06-02 18:32:35.847	f
86	11	Rich	2025-06-02 18:32:42.408	2025-06-02 18:32:42.408	f
87	11	DogDay	2025-06-02 18:32:48.916	2025-06-02 18:32:48.916	f
88	11	Doktor	2025-06-02 18:32:58.352	2025-06-02 18:32:58.352	f
89	11	Dr. White	2025-06-02 18:33:03.18	2025-06-02 18:33:03.18	f
90	11	Prototip	2025-06-02 18:33:10.282	2025-06-02 18:33:10.282	f
91	11	Kicken Chicken	2025-06-02 18:33:20.895	2025-06-02 18:33:20.895	f
92	11	Eddie Ritterman	2025-06-02 18:33:32.674	2025-06-02 18:33:32.674	f
93	11	Gardiyan 1	2025-06-02 18:33:38.56	2025-06-02 18:33:38.56	f
94	11	Gardiyan 2	2025-06-02 18:33:42.323	2025-06-02 18:33:42.323	f
95	11	Pianosaurus	2025-06-02 18:33:51.597	2025-06-02 18:33:51.597	f
96	11	Baba	2025-06-02 18:33:55.03	2025-06-02 18:33:55.03	f
97	11	Hoppy	2025-06-02 18:34:06.991	2025-06-02 18:34:06.991	f
98	11	Anne	2025-06-02 18:34:12.053	2025-06-02 18:34:12.053	f
99	11	Jack	2025-06-02 18:34:15.725	2025-06-02 18:34:15.725	f
100	11	Leith Pierre	2025-06-02 18:34:21.199	2025-06-02 18:34:33.294	f
101	11	Ollie	2025-06-02 18:34:39.414	2025-06-02 18:34:39.414	f
102	11	Stella Greyber	2025-06-02 18:34:47.545	2025-06-02 18:34:47.545	f
103	11	Poppy	2025-06-02 18:34:50.766	2025-06-02 18:34:50.766	f
104	11	Scout	2025-06-02 18:34:56.957	2025-06-02 18:34:56.957	f
105	11	Yarnaby	2025-06-02 18:35:02.363	2025-06-02 18:35:02.363	f
106	11	Warden	2025-06-02 18:35:08.272	2025-06-02 18:35:08.272	f
107	12	Spooky	2025-06-02 18:44:32.17	2025-06-02 18:44:36.08	f
108	12	Statik Ses	2025-06-02 18:44:49.554	2025-06-02 18:44:49.554	f
109	12	DL	2025-06-02 18:44:55.881	2025-06-02 18:44:55.881	f
110	12	Tilki	2025-06-02 18:45:04.546	2025-06-02 18:45:04.546	f
111	12	Ring	2025-06-02 18:45:08.804	2025-06-02 18:45:08.804	f
112	12	Canavar	2025-06-02 18:45:18.521	2025-06-02 18:45:18.521	f
114	12	Telefon Sesi	2025-06-02 18:45:37.051	2025-06-02 18:45:37.051	f
115	12	Kedi	2025-06-02 18:46:08.043	2025-06-02 18:46:08.043	f
\.


--
-- Data for Name: project_dislikes; Type: TABLE DATA; Schema: public; Owner: prestij_user
--

COPY public.project_dislikes (id, "userId", "projectId", "createdAt") FROM stdin;
5	3	11	2025-06-18 00:00:26.194
\.


--
-- Data for Name: project_favorites; Type: TABLE DATA; Schema: public; Owner: prestij_user
--

COPY public.project_favorites (id, "userId", "projectId", "createdAt") FROM stdin;
6	3	12	2025-06-02 19:23:27.392
7	3	9	2025-06-02 19:52:57.01
8	3	10	2025-06-02 19:53:12.035
9	3	8	2025-06-02 19:53:16.28
10	3	11	2025-06-02 19:53:19.483
11	16	13	2025-06-17 12:58:35.401
12	2	13	2025-06-18 10:44:54.515
14	3	13	2025-06-18 10:45:41.191
15	2	25	2025-09-03 19:49:14.387
16	16	25	2025-09-03 20:27:11.364
\.


--
-- Data for Name: project_images; Type: TABLE DATA; Schema: public; Owner: prestij_user
--

COPY public.project_images (id, "projectId", "publicId", caption, "order", "createdAt") FROM stdin;
\.


--
-- Data for Name: project_likes; Type: TABLE DATA; Schema: public; Owner: prestij_user
--

COPY public.project_likes (id, "userId", "projectId", "createdAt") FROM stdin;
6	3	9	2025-06-02 19:52:56.55
7	3	10	2025-06-02 19:53:11.8
8	3	8	2025-06-02 19:53:15.742
11	3	12	2025-06-16 18:49:42.005
12	16	8	2025-06-17 12:47:47.716
13	16	10	2025-06-17 12:47:51.598
14	16	12	2025-06-17 12:47:54.637
15	16	11	2025-06-17 12:47:57.748
16	16	9	2025-06-17 12:48:01.151
17	2	11	2025-06-17 12:48:20.927
18	16	13	2025-06-17 12:57:34.336
20	8	13	2025-06-18 10:38:59.275
21	2	13	2025-06-18 10:44:53.559
23	3	13	2025-06-18 10:45:40.994
24	9	22	2025-08-06 16:16:37.303
25	7	13	2025-08-10 15:32:12.828
26	7	9	2025-08-10 15:32:28.306
27	12	25	2025-08-30 22:18:20.855
28	2	25	2025-09-03 19:49:14.023
29	16	25	2025-09-03 20:27:10.577
\.


--
-- Data for Name: project_ratings; Type: TABLE DATA; Schema: public; Owner: prestij_user
--

COPY public.project_ratings (id, "userId", "projectId", value, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: prestij_user
--

COPY public.projects (id, title, slug, type, description, "coverImagePublicId", "bannerImagePublicId", "externalWatchUrl", "releaseDate", "isPublished", "createdAt", "updatedAt", "viewCount", "likeCount", "dislikeCount", "favoriteCount", "averageRating", "ratingCount", "trailerUrl", price, currency, "isFeaturedForCountdown", "progressPercentage") FROM stdin;
12	Spookys Jump Scare Mansion HD Renovation Türkçe Dublaj	spookytrdub	oyun	\N	project_covers/spookytrdub_953cb35f546e5e0b2f8ba16b417890c8_1748889859965	project_banners/spookytrdub_1_1745876563_1069603819_1748889815959	https://drive.google.com/file/d/15jqz2EeQRsi9CFSMSjDY3dS0FEpUpBrt/view?usp=sharing	2025-06-02 00:00:00	t	2025-06-02 18:43:36.82	2025-07-24 12:23:29.757	0	2	0	1	0	0	https://www.youtube.com/watch?v=mn-0Bh0IKoY&ab_channel=PrestijStudio	\N	\N	f	\N
10	Poppy Playtime Bölüm 3 Türkçe Dublaj	ppc3trdub	oyun	Playtime Co.’nun sisler içindeki geçmişi ve yeniden canlanan kâbusları bu kez çok daha karanlık!\nChapter 3 ile birlikte korkunun nefesi ensende, üstelik Türkçe dublaj ile gerilimi zirvede hissedeceksin!\nGaz maskeni tak ve derin bir nefes al, çünkü Bekçi artık burada.\nOyuncak fabrikasının unutulmuş koridorlarında boğucu atmosfer, soğuk fısıltılar ve bitmeyen kaçış mücadelesi seni bekliyor.\nHer diyalog, her çığlık ve her tehdit Türkçe dublajlı olarak kulağında yankılanacak.\nSaklanacak bir yerin yok… Nefesin yetmeyecek… Ama duyacaksın!\nTürkçe dublajlı Poppy Playtime Chapter 3 yamasını şimdi indir ve korkunun kalbine dal!	project_covers/ppc3trdub_w500_1748888878582	project_banners/ppc3trdub_kz8ghs79koe_hd_1748888880266	https://drive.google.com/file/d/1rZqdUCFcoPlWtH60fgPyjHqvoAnjM72s/view?usp=sharing	2025-06-02 00:00:00	t	2025-06-02 17:50:11.715	2025-07-24 12:22:57.367	0	2	0	1	0	0	https://www.youtube.com/watch?v=5QW_Ec_0Whc&ab_channel=PrestijStudio	\N	\N	f	\N
11	Poppy Playtime Bölüm 4 Türkçe Dublaj	ppc4trdub	oyun	Geçmiş Gömülemez… ve Kabuslar Asla Bitmez!\nPlaytime Co.’nun en derin sırları nihayet gün yüzüne çıkıyor! Ama kaçış yok, çünkü karanlık geçmiş seni geri çağırıyor…\nBu kez çok daha tehlikeli ve çok daha acımasız bir oyun seni bekliyor.\nChapter 4 ile korkunun en boğucu atmosferini yaşarken, Türkçe dublaj ile her korkuyu, her fısıltıyı, her tehdidi en derininde hissedeceksin!\nYeni kabuslar, yeni düşmanlar ve unutulmuş sırlar seni bekliyor…\nÇıkış yolu çok daha karmaşık, düşmanların çok daha akıllı, ve zaman hızla tükeniyor!\nPoppy Playtime Chapter 4 Türkçe dublaj yaması ile korkuyu iliklerine kadar hissedeceksin…\nŞimdi indir ve karanlığın seni çağırmasına izin ver!	project_covers/ppc4trdub_poppy_playtime_1m36x_1748889586675	project_banners/ppc4trdub_a95wlm_8lbo_hd_1748889588638	https://drive.google.com/file/d/16uqOB8WG3wEh3GsOO1TF_YEC28WFS5re/view?usp=sharing	2025-06-02 00:00:00	t	2025-06-02 18:30:19.927	2025-07-24 12:24:01.718	0	2	1	1	0	0	https://www.youtube.com/watch?v=3ezW0jLS_zA	\N	\N	f	\N
22	Undertale Türkçe Dublaj Modu	undertaledub	oyun	\N	project_covers/undertaledub_undertale_kapak_1752772134161	project_banners/undertaledub_61sjllzwnnl__uf894_1000_ql80__1752772136199	\N	2025-10-15 00:00:00	t	2025-07-17 17:08:57.516	2025-08-06 16:16:37.314	0	1	0	0	0	0	\N	\N	TRY	f	\N
8	Poppy Playtime Bölüm 1 Türkçe Dublaj	ppc1trdub	oyun	Terkedilmiş bir oyuncak fabrikasında geçen, gerilim dolu bir maceraya hazır mısınız?\n\nPoppy Playtime: Chapter 1 2 ve 3 , sizi gizemli bir geçmişe sahip Playtime Co.'nun içine sürüklüyor. Kaybolan çalışanların sırrını çözmek, dev oyuncaklardan kaçmak ve Poppy’nin gerçeğini ortaya çıkarmak sizin elinizde.\n\nVe şimdi bu ürkütücü deneyimi ilk kez tamamen Türkçe dublajlı olarak yaşayın!\n\nKarakterlerin konuşmaları, gerilimi ikiye katlayan seslendirmeler ve yerelleştirilmiş atmosfer sayesinde, oyunun karanlık hikayesi artık size çok daha yakın...	project_covers/ppc1trdub_poppy_playtime_yaypc_1748884127090	project_banners/ppc1trdub_maxresdefault_1748884129465	https://drive.google.com/file/d/1J_7XgpjzCGEJLN2jy_cX-rdxHc_fTfdy/view	2025-06-02 00:00:00	t	2025-06-02 17:08:50.504	2025-07-29 07:27:55.853	0	2	0	1	0	0	https://www.youtube.com/watch?v=5QW_Ec_0Whc&ab_channel=PrestijStudio	\N	\N	f	\N
13	Resident Evil 8 Türkçe Dublaj	re8trdub	oyun	\N	project_covers/re8trdub_re_village_button_fin_1611277715193_1750164951771	project_banners/re8trdub_thumbnail_min_1750164954282	\N	2025-06-30 00:00:00	t	2025-06-17 12:54:32.608	2025-09-07 19:17:24.629	0	5	0	3	0	0	https://www.youtube.com/watch?v=0Gd1gcFaBWU	\N	\N	f	\N
9	Poppy Playtime Bölüm 2 Türkçe Dublaj	ppc2trdub	oyun	Poppy Playtime’ın ikinci bölümü ile kabus yeni boyutlar kazanıyor! Mommy Long Legs’in ürkütücü dokunuşları, Playtime Co.’nun unutulmuş sırları ve oyunun en ürkütücü anları artık tamamen Türkçe dublaj ile sizlerle!\nLabirent gibi fabrikanın karanlık köşelerinde kaybolurken, karakterlerin sesi size fısıldayan bir korku olacak. Mommy Long Legs’in rahatsız edici şefkati, Huggy Wuggy’nin gölgelerden yükselen tehdidi ve gizemli oyuncakların ürpertici diyalogları Türkçe seslendirme ile daha da derinleşiyor!\nSaklanmaya hazır mısın? Kaçarken fısıltıları duyabilecek misin?\nTürkçe dublajlı Poppy Playtime Chapter 2 yamasını şimdi indir ve korkunun içine dal!	project_covers/ppc2trdub_apps_46767_14477333831357149_2fcd917a_62bb_4d3e_add6_da6c655c8aca_1748886357962	project_banners/ppc2trdub_qgsavdp78xk_hd_1748886359307	https://drive.google.com/file/d/1J_7XgpjzCGEJLN2jy_cX-rdxHc_fTfdy/view	2025-06-02 00:00:00	t	2025-06-02 17:21:38.193	2025-08-10 15:32:28.308	0	3	0	1	0	0	https://www.youtube.com/watch?v=5QW_Ec_0Whc&ab_channel=PrestijStudio	\N	\N	f	\N
25	Untill Dawn Türkçe Dublaj	untildawntrdub	oyun	\N	project_covers/untildawntrdub_until_dawn_turkce_dublaj_1756571320303	project_banners/untildawntrdub_until_dawn_review_banner_1756415191959	\N	2025-08-29 00:00:00	t	2025-08-28 21:06:33.302	2025-09-11 20:27:09.708	0	3	0	2	0	0	\N	\N	\N	f	0
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: prestij_user
--

COPY public.sessions (id, "sessionToken", "userId", expires) FROM stdin;
\.


--
-- Data for Name: support_requests; Type: TABLE DATA; Schema: public; Owner: prestij_user
--

COPY public.support_requests (id, title, message, amount, status, "createdAt", "updatedAt", "userId") FROM stdin;
\.


--
-- Data for Name: support_suggestions; Type: TABLE DATA; Schema: public; Owner: prestij_user
--

COPY public.support_suggestions (id, "gameTitle", "steamUrl", notes, "userId", "supporterName", "supportAmount", "paymentProvider", "transactionId", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: team_applications; Type: TABLE DATA; Schema: public; Owner: prestij_user
--

COPY public.team_applications (id, "userId", "selectedRole", message, status, "createdAt", "updatedAt", "detailsJson") FROM stdin;
\.


--
-- Data for Name: user_blocks; Type: TABLE DATA; Schema: public; Owner: prestij_user
--

COPY public.user_blocks ("blockerId", "blockingId", "createdAt") FROM stdin;
\.


--
-- Data for Name: user_notifications; Type: TABLE DATA; Schema: public; Owner: prestij_user
--

COPY public.user_notifications (id, "isRead", "userId", "notificationId") FROM stdin;
1	f	19	1
2	f	4	1
3	f	13	1
4	f	14	1
5	f	7	1
6	f	5	1
7	f	6	1
8	f	15	1
11	f	10	1
12	f	11	1
14	f	17	1
13	t	12	1
17	f	19	2
18	f	4	2
19	f	13	2
20	f	14	2
21	f	7	2
22	f	5	2
23	f	6	2
24	f	15	2
27	f	10	2
28	f	11	2
29	f	17	2
33	f	21	2
34	f	19	3
35	f	4	3
36	f	13	3
37	f	14	3
38	f	7	3
39	f	5	3
40	f	6	3
41	f	15	3
44	f	10	3
45	f	11	3
46	f	17	3
50	f	21	3
51	f	19	4
52	f	4	4
53	f	13	4
54	f	14	4
55	f	7	4
56	f	5	4
57	f	6	4
58	f	15	4
61	f	10	4
62	f	11	4
63	f	17	4
67	f	21	4
68	f	23	4
9	t	8	1
25	t	8	2
42	t	8	3
59	t	8	4
10	t	9	1
26	t	9	2
43	t	9	3
60	t	9	4
15	t	16	1
31	t	16	2
48	t	16	3
65	t	16	4
32	t	20	2
49	t	20	3
66	t	20	4
69	f	19	5
70	f	4	5
71	f	13	5
72	f	14	5
73	f	7	5
74	f	5	5
75	f	6	5
76	f	15	5
77	f	10	5
78	f	11	5
79	f	17	5
82	f	27	5
83	f	20	5
84	f	21	5
85	f	23	5
86	f	22	5
87	f	24	5
88	f	25	5
89	f	26	5
90	f	9	5
91	f	28	5
30	t	12	2
47	t	12	3
64	t	12	4
80	t	12	5
92	t	29	5
81	t	16	5
93	f	32	6
94	t	12	7
\.


--
-- Data for Name: user_owned_games; Type: TABLE DATA; Schema: public; Owner: prestij_user
--

COPY public.user_owned_games (id, "userId", "projectId", "purchasedAt", "purchasePrice") FROM stdin;
\.


--
-- Data for Name: user_reports; Type: TABLE DATA; Schema: public; Owner: prestij_user
--

COPY public.user_reports (id, reason, description, "reporterId", "reportedId", "createdAt", status) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: prestij_user
--

COPY public.users (id, email, username, "firstName", "lastName", password, role, "profileImagePublicId", "bannerImagePublicId", bio, "createdAt", "updatedAt", "isBanned", "banExpiresAt", "banReason") FROM stdin;
19	ndsjdjds@gmail.com	leshapbenimbabam	\N	\N	$2b$10$Ks3U56qRLaZLf3IbEkL7MuXjpTDRZ9aLuerzgiAJdPZnYj/EscY3q	USER	\N	\N	\N	2025-06-18 11:24:14.223	2025-06-18 11:24:14.223	f	\N	\N
2	byorhanyzgt@gmail.com	Rizz	\N	\N	$2b$10$1WkJUvNusDYbn3ZdqYVSu.wnt4mc.QBGQFFzOAQFNlrbDvhAI80LS	ADMIN	\N	\N	\N	2025-06-02 09:45:25.482	2025-06-02 09:46:31.808	f	\N	\N
4	kawisrr@gmail.com	Adonegi	\N	\N	$2b$10$WQDr1jqa81krK7FmVU0a9ebu5f6PP8qSc4ints0qZChcLLy6BY3Gq	USER	\N	\N	\N	2025-06-02 11:35:33.97	2025-06-02 11:35:33.97	f	\N	\N
13	handebuyukceylan@gmail.com	kutsi23	\N	\N	$2b$10$DP.LUV8Puui6hi4SIYt0aeQfIKGDhYsOjGRjOV.1sEYlCy6KV/Cbe	USER	user_profiles/13/userprofile_13_gezf_bbwqaapjt__1749720568246	user_banners/13/userbanner_13_wallpaperflare_com_wallpaper_1749720768810	Saxafon🎷	2025-06-12 09:18:45.815	2025-06-12 09:33:53.402	f	\N	\N
14	azginboga@mail.com	azgın boğa	\N	\N	$2b$10$aGGiv6GEeyWO1Jm4lF09Zur1H/wEYbSENRA58.4jRPJzZ50z9n0bW	USER	\N	\N	\N	2025-06-12 13:02:16.841	2025-06-12 13:02:16.841	f	\N	\N
7	bartutuna00@gmail.com	Myki222222	\N	\N	$2b$10$LXvYIcfHxWgNWxBhSSVHluGVkMp5ws5C.302nKpU6RCTzqIpHVw/e	USER	user_profiles/7/userprofile_7_channels4_profile_2__1749820593960	user_banners/7/userbanner_7_resim_2025_06_13_161653958_1749820583821	\N	2025-06-02 20:11:33.16	2025-06-13 13:16:36.081	f	\N	\N
5	saqorae@gmail.com	arima	\N	\N	$2b$10$jdlpOM74xC7uHRJYcAEkVutbb1aH.0FYxxLrkhof4gTsbDk5X4Cei	USER	user_profiles/5/userprofile_5_10e9f9f2c56aee6e73af85cb8780e0e9_1748865099909	user_banners/5/userbanner_5_e7ae5af59e3afa19cd023f16a7432c45_1748865078820	selams	2025-06-02 11:49:16.914	2025-06-02 11:52:20.185	f	\N	\N
6	hiracakar@gmail.com	reichan_5081	\N	\N	$2b$10$NWUjxZRcmIUu78TLw77RFO0JGKGwtHp6F3WESdwMlgZzzJmvToOx.	USER	\N	\N	\N	2025-06-02 15:59:48.094	2025-06-02 15:59:48.094	f	\N	\N
15	samilyuksel24@gmail.com	Şamil Yüksel	\N	\N	$2b$10$t6mNAFEnWjvPwvs/h9tMruA4RoF1YN0BOqNeleqvSkyW9Q1cDwCFe	USER	\N	\N	\N	2025-06-15 10:43:58.038	2025-06-15 10:43:58.038	f	\N	\N
10	gozele899@gmail.com	eren	\N	\N	$2b$10$IsD6RdVFTamT1gLjcGWvAe3xqHO/hGX3crJMbnKQ3b2UGbu5gIBDK	USER	\N	\N	\N	2025-06-08 22:29:01.302	2025-06-08 22:29:01.302	f	\N	\N
11	aebucendel05@gmail.com	Ebu	\N	\N	$2b$10$Mc7/sYFXtMCDrkLdHj79deo41goFEjWJGTLIxaPAaGJBr.n/mRu7e	USER	\N	\N	\N	2025-06-09 00:00:18.944	2025-06-09 00:00:18.944	f	\N	\N
17	ezginursonmez70@gmail.com	ezg1ss	\N	\N	$2b$10$45YinrWtlpqzFsDr/lNbhOfuUJa8tUeDl/5ZbHFh2cH6z..dVAkaW	USER	user_profiles/17/userprofile_17_img_1005_1750152368361	user_banners/17/userbanner_17_img_0964_1750152361315	\N	2025-06-17 09:24:47.711	2025-06-17 09:26:10.944	f	\N	\N
12	test@gmail.com	test	\N	\N	$2b$10$kj7L2ftajICZDVEx4H3Jlu765N/xbt4y7lV3pVCADfctKjzkvITLi	USER	\N	\N	\N	2025-06-12 07:46:03.688	2025-06-19 07:35:36.615	f	\N	\N
16	oyunustasigodzilla@gmail.com	MrGodzilla	\N	\N	$2b$10$Hmxa0ODMB7kmWQAwaew7jOM8TL8mdXBpfTzWQYxehY8wsMG1pD2l6	USER	user_profiles/16/userprofile_16_6d86d41e_2dd4_42ef_a4ca_14b7bf4b38839_1750166119874	user_banners/16/userbanner_16_userbanner_16_karanlik_1750166970358_1750167132060	Akıllı delilerdendir	2025-06-17 08:31:38.744	2025-06-17 13:32:32.17	f	\N	\N
27	hasanemrek1@gmail.com	Orv_85	\N	\N	$2b$10$n8SF/AXIrasLifS9/QtaeufG2wEfeguPYGjvSqOeySntG1YooLZ26	USER	user_profiles/27/userprofile_27_mgxcgb0o3g5c1_1754517829976	user_banners/27/userbanner_27_s_677dcb3a1dc127fd5aec95e9833f6337afe51b_1754518210186	\N	2025-08-06 22:01:38.923	2025-08-06 22:10:12.207	f	\N	\N
20	ozenalperen2007@gmail.com	OGWIN	\N	\N	$2b$10$Op73Ue.m7AMj1gsFQxamvuJ.GAS8IZEjS1xxWTTWxR2zgmr6kzp5q	USER	\N	\N	\N	2025-07-12 16:09:50.115	2025-07-12 16:09:50.115	f	\N	\N
21	t8505022@gmail.com	k4geiz_emre	\N	\N	$2b$10$da3dDEvb.CAqOOFRYhK3aehyYAebYeZpU0HV2/SQ4RIkCZq.LK/8G	USER	\N	\N	\N	2025-07-15 11:01:28.8	2025-07-15 11:01:28.8	f	\N	\N
23	beratoral99@gmail.com	Shadow	\N	\N	$2b$10$mq2lLI1S5MLDYX4zaCu5mO9wEmE7aO5JOb/.mxJ6iMywZlzDWY25.	USER	\N	\N	\N	2025-07-25 10:26:27.996	2025-07-25 10:26:27.996	f	\N	\N
22	arslanomeryigit199@gmail.com	omerygtrsln	\N	\N	$2b$10$cD7Nn39TAh15twvkFtR5MeUFwwPt7b78T2QDf524QKUKtPD0y6rky	USER	\N	\N	\N	2025-07-17 14:45:07.622	2025-08-08 00:36:03.417	f	\N	\N
24	muhammetnayci61@gmail.com	Yagami	\N	\N	$2b$10$5FrvOw3csq20.Vdb3WMaYOW5xZkTrLyxbEpstFe0wedd6tLsyLYh2	USER	user_profiles/24/userprofile_24_img_20250716_033104_130_1753652475064	\N	Baba pro	2025-07-27 21:39:44.867	2025-07-27 21:41:36.624	f	\N	\N
8	mehmeteren2006@gmail.com	Kou	\N	\N	$2b$10$t6zQiEQBWwi7qQte0WDsM.dzmsBad6oZSuJy28cgrVY4SBOkGYqTa	ADMIN	\N	\N	\N	2025-06-07 16:08:52.81	2025-08-01 16:00:21.399	f	\N	\N
25	ferhatnurkan09@gmail.com	Mr_Renn	\N	\N	$2b$10$Roh..Sj5sROyVkYpZVzOx..R9MBKWTM4mPXuNwjNrComWdSsF8CCG	USER	\N	\N	\N	2025-08-03 16:57:32.624	2025-08-03 16:57:32.624	f	\N	\N
26	erencankarahilaloglu@gmail.com	Levhecoher	\N	\N	$2b$10$jao6JRiMzSlP6AePwWvIA.gifR8N0eHqUtRltok2aDnhjPWOODvhK	USER	\N	\N	\N	2025-08-04 15:42:54.883	2025-08-04 15:42:54.883	f	\N	\N
9	4d4w0ng86@gmail.com	tsukii	\N	\N	$2b$10$2Z9J1epYqY61RkAeyaDrxeWcotYshd0RHJx8CqWsYG5297ZnZGFWS	USER	user_profiles/9/userprofile_9_0d6fed0500d226cbc3705946e4a2daef_1754496943669	\N	dürüm yiyorum öyleyse varım.	2025-06-08 18:49:52.483	2025-08-06 16:21:13.384	f	\N	\N
28	berra.ceyhun@gmail.com	sevko	\N	\N	$2b$10$SNobMVO7PLFGgJq151va/OOwu1uz.63B8s.ZqS36IuekmlNG0eCDm	USER	\N	\N	\N	2025-08-06 22:02:55.398	2025-08-06 22:02:55.398	f	\N	\N
3	005emreebulutt005@gmail.com	Chimiya	\N	\N	$2b$10$TNl3lq.LDYDZVJtW7qiUDOgELrmYvQ03gj19YqW0sE3fjAe6NUEG2	ADMIN	user_profiles/3/userprofile_3_9f8078e7b069e8e9ab914a3445ae8650_1750166291299	user_banners/3/userbanner_3_ekran_g_r_nt_s_2025_03_20_132519_1748893951022	Selam Ben Adal	2025-06-02 11:24:16.349	2025-08-08 15:21:42.505	f	\N	\N
29	lunarr095@outlook.com	Kiyoko	\N	\N	$2b$10$LVEOgSbwJ4ByhFAkN9PpeOSEgQPHDyXfZDheVXYus8BR/tk1VQN3i	USER	user_profiles/29/userprofile_29_520882699_662415836841870_20571870422926_1755439111535	user_banners/29/userbanner_29_ff0339aa_4862_4c85_8f1e_434d4e834b02_1755439066156	\N	2025-08-17 13:23:50.097	2025-08-17 13:58:33.736	f	\N	\N
30	karimovmurat007@gmail.com	Mehmet	\N	\N	$2b$10$e9/V/MagPZJoPd9VyJne3.1EePpOrCBex1Pz.D1tEIFt1sNrQStIC	USER	\N	\N	\N	2025-08-28 23:58:17.157	2025-08-28 23:58:17.157	f	\N	\N
31	rottreg31@gmail.com	rottreg12	\N	\N	$2b$10$.GcLwiC5m7jQAzfPkGf4heBTQughwSYWdkH276TTo6IVBDkocxN1.	USER	\N	\N	\N	2025-09-05 23:58:31.257	2025-09-05 23:58:31.257	f	\N	\N
32	emir505emir@gmail.com	emirxyz	\N	\N	$2b$10$FNMm0xvXOqSxXVRgEVsIhe/i.oO0toxd01QqFIINTHtx2H2SOMPx2	USER	\N	\N	\N	2025-09-07 19:06:57.372	2025-09-07 19:06:57.372	f	\N	\N
\.


--
-- Data for Name: verification_tokens; Type: TABLE DATA; Schema: public; Owner: prestij_user
--

COPY public.verification_tokens (identifier, token, expires) FROM stdin;
\.


--
-- Data for Name: voice_assignments; Type: TABLE DATA; Schema: public; Owner: prestij_user
--

COPY public.voice_assignments (id, "projectAssignmentId", "projectCharacterId") FROM stdin;
531	385	4
532	386	7
533	387	9
534	388	10
535	389	2
536	390	5
537	391	8
453	324	44
454	324	45
455	325	35
456	326	36
457	326	61
458	326	62
459	327	37
460	327	63
461	328	38
462	329	39
463	329	64
464	330	40
465	330	50
466	330	56
467	330	58
468	331	65
469	332	42
470	332	66
471	333	43
472	334	46
473	334	53
474	335	47
475	335	48
476	336	47
477	336	57
478	337	49
479	338	51
480	339	52
481	340	54
482	341	55
483	341	60
484	341	68
485	342	69
486	343	55
487	343	70
488	349	41
489	350	107
490	351	108
491	352	109
492	353	110
493	354	111
494	355	112
495	356	114
496	357	115
497	361	72
498	362	73
499	362	78
500	362	79
501	362	81
502	362	80
503	363	74
504	364	75
505	364	82
506	365	76
507	365	83
508	365	84
509	366	77
510	367	85
511	367	86
512	367	87
513	368	88
514	369	89
515	370	90
516	370	91
517	370	92
518	371	93
519	372	94
520	372	95
521	373	96
522	374	97
523	374	98
524	375	99
525	376	100
526	377	90
527	377	101
528	378	104
529	379	105
530	379	106
538	395	13
539	395	23
540	396	18
541	396	32
542	397	17
543	398	33
544	399	34
545	400	22
546	401	19
547	402	24
548	402	31
549	403	25
550	403	30
551	404	15
552	405	20
553	405	27
554	406	14
555	406	16
556	406	26
\.


--
-- Data for Name: voice_submissions; Type: TABLE DATA; Schema: public; Owner: prestij_user
--

COPY public.voice_submissions (id, "dialogueId", "userId", "audioFilePublicId", notes, status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prestij_user
--

SELECT pg_catalog.setval('public.accounts_id_seq', 1, false);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prestij_user
--

SELECT pg_catalog.setval('public.categories_id_seq', 16, true);


--
-- Name: character_dialogues_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prestij_user
--

SELECT pg_catalog.setval('public.character_dialogues_id_seq', 1, false);


--
-- Name: comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prestij_user
--

SELECT pg_catalog.setval('public.comments_id_seq', 9, true);


--
-- Name: community_suggestions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prestij_user
--

SELECT pg_catalog.setval('public.community_suggestions_id_seq', 1, false);


--
-- Name: download_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prestij_user
--

SELECT pg_catalog.setval('public.download_logs_id_seq', 1, false);


--
-- Name: dubbing_artist_favorites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prestij_user
--

SELECT pg_catalog.setval('public.dubbing_artist_favorites_id_seq', 50, true);


--
-- Name: dubbing_artist_likes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prestij_user
--

SELECT pg_catalog.setval('public.dubbing_artist_likes_id_seq', 63, true);


--
-- Name: dubbing_artists_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prestij_user
--

SELECT pg_catalog.setval('public.dubbing_artists_id_seq', 73, true);


--
-- Name: email_change_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prestij_user
--

SELECT pg_catalog.setval('public.email_change_requests_id_seq', 1, false);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prestij_user
--

SELECT pg_catalog.setval('public.messages_id_seq', 35, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prestij_user
--

SELECT pg_catalog.setval('public.notifications_id_seq', 7, true);


--
-- Name: project_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prestij_user
--

SELECT pg_catalog.setval('public.project_assignments_id_seq', 409, true);


--
-- Name: project_characters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prestij_user
--

SELECT pg_catalog.setval('public.project_characters_id_seq', 115, true);


--
-- Name: project_dislikes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prestij_user
--

SELECT pg_catalog.setval('public.project_dislikes_id_seq', 5, true);


--
-- Name: project_favorites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prestij_user
--

SELECT pg_catalog.setval('public.project_favorites_id_seq', 16, true);


--
-- Name: project_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prestij_user
--

SELECT pg_catalog.setval('public.project_images_id_seq', 1, false);


--
-- Name: project_likes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prestij_user
--

SELECT pg_catalog.setval('public.project_likes_id_seq', 30, true);


--
-- Name: project_ratings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prestij_user
--

SELECT pg_catalog.setval('public.project_ratings_id_seq', 1, false);


--
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prestij_user
--

SELECT pg_catalog.setval('public.projects_id_seq', 25, true);


--
-- Name: sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prestij_user
--

SELECT pg_catalog.setval('public.sessions_id_seq', 1, false);


--
-- Name: support_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prestij_user
--

SELECT pg_catalog.setval('public.support_requests_id_seq', 1, false);


--
-- Name: support_suggestions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prestij_user
--

SELECT pg_catalog.setval('public.support_suggestions_id_seq', 1, false);


--
-- Name: team_applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prestij_user
--

SELECT pg_catalog.setval('public.team_applications_id_seq', 1, false);


--
-- Name: user_notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prestij_user
--

SELECT pg_catalog.setval('public.user_notifications_id_seq', 94, true);


--
-- Name: user_owned_games_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prestij_user
--

SELECT pg_catalog.setval('public.user_owned_games_id_seq', 2, true);


--
-- Name: user_reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prestij_user
--

SELECT pg_catalog.setval('public.user_reports_id_seq', 3, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prestij_user
--

SELECT pg_catalog.setval('public.users_id_seq', 32, true);


--
-- Name: voice_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prestij_user
--

SELECT pg_catalog.setval('public.voice_assignments_id_seq', 556, true);


--
-- Name: voice_submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prestij_user
--

SELECT pg_catalog.setval('public.voice_submissions_id_seq', 1, false);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: character_dialogues character_dialogues_pkey; Type: CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.character_dialogues
    ADD CONSTRAINT character_dialogues_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: community_suggestion_votes community_suggestion_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.community_suggestion_votes
    ADD CONSTRAINT community_suggestion_votes_pkey PRIMARY KEY ("userId", "suggestionId");


--
-- Name: community_suggestions community_suggestions_pkey; Type: CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.community_suggestions
    ADD CONSTRAINT community_suggestions_pkey PRIMARY KEY (id);


--
-- Name: download_logs download_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.download_logs
    ADD CONSTRAINT download_logs_pkey PRIMARY KEY (id);


--
-- Name: dubbing_artist_favorites dubbing_artist_favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.dubbing_artist_favorites
    ADD CONSTRAINT dubbing_artist_favorites_pkey PRIMARY KEY (id);


--
-- Name: dubbing_artist_likes dubbing_artist_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.dubbing_artist_likes
    ADD CONSTRAINT dubbing_artist_likes_pkey PRIMARY KEY (id);


--
-- Name: dubbing_artists dubbing_artists_pkey; Type: CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.dubbing_artists
    ADD CONSTRAINT dubbing_artists_pkey PRIMARY KEY (id);


--
-- Name: email_change_requests email_change_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.email_change_requests
    ADD CONSTRAINT email_change_requests_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: project_assignments project_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.project_assignments
    ADD CONSTRAINT project_assignments_pkey PRIMARY KEY (id);


--
-- Name: project_categories project_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.project_categories
    ADD CONSTRAINT project_categories_pkey PRIMARY KEY ("projectId", "categoryId");


--
-- Name: project_characters project_characters_pkey; Type: CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.project_characters
    ADD CONSTRAINT project_characters_pkey PRIMARY KEY (id);


--
-- Name: project_dislikes project_dislikes_pkey; Type: CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.project_dislikes
    ADD CONSTRAINT project_dislikes_pkey PRIMARY KEY (id);


--
-- Name: project_favorites project_favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.project_favorites
    ADD CONSTRAINT project_favorites_pkey PRIMARY KEY (id);


--
-- Name: project_images project_images_pkey; Type: CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.project_images
    ADD CONSTRAINT project_images_pkey PRIMARY KEY (id);


--
-- Name: project_likes project_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.project_likes
    ADD CONSTRAINT project_likes_pkey PRIMARY KEY (id);


--
-- Name: project_ratings project_ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.project_ratings
    ADD CONSTRAINT project_ratings_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: support_requests support_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.support_requests
    ADD CONSTRAINT support_requests_pkey PRIMARY KEY (id);


--
-- Name: support_suggestions support_suggestions_pkey; Type: CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.support_suggestions
    ADD CONSTRAINT support_suggestions_pkey PRIMARY KEY (id);


--
-- Name: team_applications team_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.team_applications
    ADD CONSTRAINT team_applications_pkey PRIMARY KEY (id);


--
-- Name: user_blocks user_blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.user_blocks
    ADD CONSTRAINT user_blocks_pkey PRIMARY KEY ("blockerId", "blockingId");


--
-- Name: user_notifications user_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.user_notifications
    ADD CONSTRAINT user_notifications_pkey PRIMARY KEY (id);


--
-- Name: user_owned_games user_owned_games_pkey; Type: CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.user_owned_games
    ADD CONSTRAINT user_owned_games_pkey PRIMARY KEY (id);


--
-- Name: user_reports user_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.user_reports
    ADD CONSTRAINT user_reports_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: voice_assignments voice_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.voice_assignments
    ADD CONSTRAINT voice_assignments_pkey PRIMARY KEY (id);


--
-- Name: voice_submissions voice_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.voice_submissions
    ADD CONSTRAINT voice_submissions_pkey PRIMARY KEY (id);


--
-- Name: accounts_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: prestij_user
--

CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON public.accounts USING btree (provider, "providerAccountId");


--
-- Name: categories_name_key; Type: INDEX; Schema: public; Owner: prestij_user
--

CREATE UNIQUE INDEX categories_name_key ON public.categories USING btree (name);


--
-- Name: categories_slug_key; Type: INDEX; Schema: public; Owner: prestij_user
--

CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug);


--
-- Name: character_dialogues_characterId_idx; Type: INDEX; Schema: public; Owner: prestij_user
--

CREATE INDEX "character_dialogues_characterId_idx" ON public.character_dialogues USING btree ("characterId");


--
-- Name: comments_projectId_idx; Type: INDEX; Schema: public; Owner: prestij_user
--

CREATE INDEX "comments_projectId_idx" ON public.comments USING btree ("projectId");


--
-- Name: comments_userId_idx; Type: INDEX; Schema: public; Owner: prestij_user
--

CREATE INDEX "comments_userId_idx" ON public.comments USING btree ("userId");


--
-- Name: community_suggestion_votes_suggestionId_idx; Type: INDEX; Schema: public; Owner: prestij_user
--

CREATE INDEX "community_suggestion_votes_suggestionId_idx" ON public.community_suggestion_votes USING btree ("suggestionId");


--
-- Name: community_suggestions_steamUrl_key; Type: INDEX; Schema: public; Owner: prestij_user
--

CREATE UNIQUE INDEX "community_suggestions_steamUrl_key" ON public.community_suggestions USING btree ("steamUrl");


--
-- Name: community_suggestions_submittedById_idx; Type: INDEX; Schema: public; Owner: prestij_user
--

CREATE INDEX "community_suggestions_submittedById_idx" ON public.community_suggestions USING btree ("submittedById");


--
-- Name: download_logs_projectId_idx; Type: INDEX; Schema: public; Owner: prestij_user
--

CREATE INDEX "download_logs_projectId_idx" ON public.download_logs USING btree ("projectId");


--
-- Name: download_logs_userId_idx; Type: INDEX; Schema: public; Owner: prestij_user
--

CREATE INDEX "download_logs_userId_idx" ON public.download_logs USING btree ("userId");


--
-- Name: dubbing_artist_favorites_userId_artistId_key; Type: INDEX; Schema: public; Owner: prestij_user
--

CREATE UNIQUE INDEX "dubbing_artist_favorites_userId_artistId_key" ON public.dubbing_artist_favorites USING btree ("userId", "artistId");


--
-- Name: dubbing_artist_likes_userId_artistId_key; Type: INDEX; Schema: public; Owner: prestij_user
--

CREATE UNIQUE INDEX "dubbing_artist_likes_userId_artistId_key" ON public.dubbing_artist_likes USING btree ("userId", "artistId");


--
-- Name: dubbing_artists_userId_key; Type: INDEX; Schema: public; Owner: prestij_user
--

CREATE UNIQUE INDEX "dubbing_artists_userId_key" ON public.dubbing_artists USING btree ("userId");


--
-- Name: email_change_requests_token_key; Type: INDEX; Schema: public; Owner: prestij_user
--

CREATE UNIQUE INDEX email_change_requests_token_key ON public.email_change_requests USING btree (token);


--
-- Name: email_change_requests_userId_idx; Type: INDEX; Schema: public; Owner: prestij_user
--

CREATE INDEX "email_change_requests_userId_idx" ON public.email_change_requests USING btree ("userId");


--
-- Name: messages_receiverId_isRead_idx; Type: INDEX; Schema: public; Owner: prestij_user
--

CREATE INDEX "messages_receiverId_isRead_idx" ON public.messages USING btree ("receiverId", "isRead");


--
-- Name: project_assignments_artistId_idx; Type: INDEX; Schema: public; Owner: prestij_user
--

CREATE INDEX "project_assignments_artistId_idx" ON public.project_assignments USING btree ("artistId");


--
-- Name: project_assignments_projectId_artistId_role_key; Type: INDEX; Schema: public; Owner: prestij_user
--

CREATE UNIQUE INDEX "project_assignments_projectId_artistId_role_key" ON public.project_assignments USING btree ("projectId", "artistId", role);


--
-- Name: project_assignments_projectId_idx; Type: INDEX; Schema: public; Owner: prestij_user
--

CREATE INDEX "project_assignments_projectId_idx" ON public.project_assignments USING btree ("projectId");


--
-- Name: project_characters_projectId_idx; Type: INDEX; Schema: public; Owner: prestij_user
--

CREATE INDEX "project_characters_projectId_idx" ON public.project_characters USING btree ("projectId");


--
-- Name: project_characters_projectId_name_key; Type: INDEX; Schema: public; Owner: prestij_user
--

CREATE UNIQUE INDEX "project_characters_projectId_name_key" ON public.project_characters USING btree ("projectId", name);


--
-- Name: project_dislikes_userId_projectId_key; Type: INDEX; Schema: public; Owner: prestij_user
--

CREATE UNIQUE INDEX "project_dislikes_userId_projectId_key" ON public.project_dislikes USING btree ("userId", "projectId");


--
-- Name: project_favorites_userId_projectId_key; Type: INDEX; Schema: public; Owner: prestij_user
--

CREATE UNIQUE INDEX "project_favorites_userId_projectId_key" ON public.project_favorites USING btree ("userId", "projectId");


--
-- Name: project_images_projectId_idx; Type: INDEX; Schema: public; Owner: prestij_user
--

CREATE INDEX "project_images_projectId_idx" ON public.project_images USING btree ("projectId");


--
-- Name: project_likes_userId_projectId_key; Type: INDEX; Schema: public; Owner: prestij_user
--

CREATE UNIQUE INDEX "project_likes_userId_projectId_key" ON public.project_likes USING btree ("userId", "projectId");


--
-- Name: project_ratings_userId_projectId_key; Type: INDEX; Schema: public; Owner: prestij_user
--

CREATE UNIQUE INDEX "project_ratings_userId_projectId_key" ON public.project_ratings USING btree ("userId", "projectId");


--
-- Name: projects_slug_key; Type: INDEX; Schema: public; Owner: prestij_user
--

CREATE UNIQUE INDEX projects_slug_key ON public.projects USING btree (slug);


--
-- Name: sessions_sessionToken_key; Type: INDEX; Schema: public; Owner: prestij_user
--

CREATE UNIQUE INDEX "sessions_sessionToken_key" ON public.sessions USING btree ("sessionToken");


--
-- Name: support_suggestions_transactionId_key; Type: INDEX; Schema: public; Owner: prestij_user
--

CREATE UNIQUE INDEX "support_suggestions_transactionId_key" ON public.support_suggestions USING btree ("transactionId");


--
-- Name: support_suggestions_userId_idx; Type: INDEX; Schema: public; Owner: prestij_user
--

CREATE INDEX "support_suggestions_userId_idx" ON public.support_suggestions USING btree ("userId");


--
-- Name: team_applications_userId_idx; Type: INDEX; Schema: public; Owner: prestij_user
--

CREATE INDEX "team_applications_userId_idx" ON public.team_applications USING btree ("userId");


--
-- Name: user_notifications_userId_notificationId_key; Type: INDEX; Schema: public; Owner: prestij_user
--

CREATE UNIQUE INDEX "user_notifications_userId_notificationId_key" ON public.user_notifications USING btree ("userId", "notificationId");


--
-- Name: user_owned_games_userId_projectId_key; Type: INDEX; Schema: public; Owner: prestij_user
--

CREATE UNIQUE INDEX "user_owned_games_userId_projectId_key" ON public.user_owned_games USING btree ("userId", "projectId");


--
-- Name: user_reports_reporterId_reportedId_key; Type: INDEX; Schema: public; Owner: prestij_user
--

CREATE UNIQUE INDEX "user_reports_reporterId_reportedId_key" ON public.user_reports USING btree ("reporterId", "reportedId");


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: prestij_user
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_username_key; Type: INDEX; Schema: public; Owner: prestij_user
--

CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);


--
-- Name: verification_tokens_identifier_token_key; Type: INDEX; Schema: public; Owner: prestij_user
--

CREATE UNIQUE INDEX verification_tokens_identifier_token_key ON public.verification_tokens USING btree (identifier, token);


--
-- Name: verification_tokens_token_key; Type: INDEX; Schema: public; Owner: prestij_user
--

CREATE UNIQUE INDEX verification_tokens_token_key ON public.verification_tokens USING btree (token);


--
-- Name: voice_assignments_projectAssignmentId_idx; Type: INDEX; Schema: public; Owner: prestij_user
--

CREATE INDEX "voice_assignments_projectAssignmentId_idx" ON public.voice_assignments USING btree ("projectAssignmentId");


--
-- Name: voice_assignments_projectAssignmentId_projectCharacterId_key; Type: INDEX; Schema: public; Owner: prestij_user
--

CREATE UNIQUE INDEX "voice_assignments_projectAssignmentId_projectCharacterId_key" ON public.voice_assignments USING btree ("projectAssignmentId", "projectCharacterId");


--
-- Name: voice_assignments_projectCharacterId_idx; Type: INDEX; Schema: public; Owner: prestij_user
--

CREATE INDEX "voice_assignments_projectCharacterId_idx" ON public.voice_assignments USING btree ("projectCharacterId");


--
-- Name: voice_submissions_dialogueId_idx; Type: INDEX; Schema: public; Owner: prestij_user
--

CREATE INDEX "voice_submissions_dialogueId_idx" ON public.voice_submissions USING btree ("dialogueId");


--
-- Name: voice_submissions_userId_idx; Type: INDEX; Schema: public; Owner: prestij_user
--

CREATE INDEX "voice_submissions_userId_idx" ON public.voice_submissions USING btree ("userId");


--
-- Name: accounts accounts_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: character_dialogues character_dialogues_characterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.character_dialogues
    ADD CONSTRAINT "character_dialogues_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES public.project_characters(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: comments comments_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "comments_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: comments comments_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: community_suggestion_votes community_suggestion_votes_suggestionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.community_suggestion_votes
    ADD CONSTRAINT "community_suggestion_votes_suggestionId_fkey" FOREIGN KEY ("suggestionId") REFERENCES public.community_suggestions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: community_suggestion_votes community_suggestion_votes_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.community_suggestion_votes
    ADD CONSTRAINT "community_suggestion_votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: community_suggestions community_suggestions_submittedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.community_suggestions
    ADD CONSTRAINT "community_suggestions_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: download_logs download_logs_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.download_logs
    ADD CONSTRAINT "download_logs_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: download_logs download_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.download_logs
    ADD CONSTRAINT "download_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: dubbing_artist_favorites dubbing_artist_favorites_artistId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.dubbing_artist_favorites
    ADD CONSTRAINT "dubbing_artist_favorites_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES public.dubbing_artists(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: dubbing_artist_favorites dubbing_artist_favorites_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.dubbing_artist_favorites
    ADD CONSTRAINT "dubbing_artist_favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: dubbing_artist_likes dubbing_artist_likes_artistId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.dubbing_artist_likes
    ADD CONSTRAINT "dubbing_artist_likes_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES public.dubbing_artists(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: dubbing_artist_likes dubbing_artist_likes_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.dubbing_artist_likes
    ADD CONSTRAINT "dubbing_artist_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: dubbing_artists dubbing_artists_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.dubbing_artists
    ADD CONSTRAINT "dubbing_artists_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: email_change_requests email_change_requests_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.email_change_requests
    ADD CONSTRAINT "email_change_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: messages messages_receiverId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT "messages_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: messages messages_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_assignments project_assignments_artistId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.project_assignments
    ADD CONSTRAINT "project_assignments_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES public.dubbing_artists(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_assignments project_assignments_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.project_assignments
    ADD CONSTRAINT "project_assignments_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_categories project_categories_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.project_categories
    ADD CONSTRAINT "project_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_categories project_categories_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.project_categories
    ADD CONSTRAINT "project_categories_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_characters project_characters_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.project_characters
    ADD CONSTRAINT "project_characters_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_dislikes project_dislikes_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.project_dislikes
    ADD CONSTRAINT "project_dislikes_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_dislikes project_dislikes_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.project_dislikes
    ADD CONSTRAINT "project_dislikes_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_favorites project_favorites_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.project_favorites
    ADD CONSTRAINT "project_favorites_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_favorites project_favorites_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.project_favorites
    ADD CONSTRAINT "project_favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_images project_images_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.project_images
    ADD CONSTRAINT "project_images_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_likes project_likes_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.project_likes
    ADD CONSTRAINT "project_likes_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_likes project_likes_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.project_likes
    ADD CONSTRAINT "project_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_ratings project_ratings_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.project_ratings
    ADD CONSTRAINT "project_ratings_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_ratings project_ratings_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.project_ratings
    ADD CONSTRAINT "project_ratings_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sessions sessions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: support_requests support_requests_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.support_requests
    ADD CONSTRAINT "support_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: support_suggestions support_suggestions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.support_suggestions
    ADD CONSTRAINT "support_suggestions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: team_applications team_applications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.team_applications
    ADD CONSTRAINT "team_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_blocks user_blocks_blockerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.user_blocks
    ADD CONSTRAINT "user_blocks_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_blocks user_blocks_blockingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.user_blocks
    ADD CONSTRAINT "user_blocks_blockingId_fkey" FOREIGN KEY ("blockingId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_notifications user_notifications_notificationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.user_notifications
    ADD CONSTRAINT "user_notifications_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES public.notifications(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_notifications user_notifications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.user_notifications
    ADD CONSTRAINT "user_notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_owned_games user_owned_games_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.user_owned_games
    ADD CONSTRAINT "user_owned_games_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_owned_games user_owned_games_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.user_owned_games
    ADD CONSTRAINT "user_owned_games_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_reports user_reports_reportedId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.user_reports
    ADD CONSTRAINT "user_reports_reportedId_fkey" FOREIGN KEY ("reportedId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_reports user_reports_reporterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.user_reports
    ADD CONSTRAINT "user_reports_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: voice_assignments voice_assignments_projectAssignmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.voice_assignments
    ADD CONSTRAINT "voice_assignments_projectAssignmentId_fkey" FOREIGN KEY ("projectAssignmentId") REFERENCES public.project_assignments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: voice_assignments voice_assignments_projectCharacterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.voice_assignments
    ADD CONSTRAINT "voice_assignments_projectCharacterId_fkey" FOREIGN KEY ("projectCharacterId") REFERENCES public.project_characters(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: voice_submissions voice_submissions_dialogueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.voice_submissions
    ADD CONSTRAINT "voice_submissions_dialogueId_fkey" FOREIGN KEY ("dialogueId") REFERENCES public.character_dialogues(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: voice_submissions voice_submissions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prestij_user
--

ALTER TABLE ONLY public.voice_submissions
    ADD CONSTRAINT "voice_submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict rkpt8F3OyJZkPn4hI3nIM5pwY8cVNT8Gg2J96TxisehHtgStwEPv1F8h7KrRqQy

