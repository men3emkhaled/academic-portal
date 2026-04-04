--
-- PostgreSQL database dump
--

\restrict MbvgZXvauuKgKLVbOcwv4ChqNWVe4BR1BOGzNNcQ5nUHHUbi8bVmPsWExTcAAuu

-- Dumped from database version 16.12 (ed61a14)
-- Dumped by pg_dump version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)

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
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: announcements; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.announcements (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.announcements OWNER TO neondb_owner;

--
-- Name: announcements_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.announcements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.announcements_id_seq OWNER TO neondb_owner;

--
-- Name: announcements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.announcements_id_seq OWNED BY public.announcements.id;


--
-- Name: career_tracks; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.career_tracks (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    is_primary boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.career_tracks OWNER TO neondb_owner;

--
-- Name: career_tracks_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.career_tracks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.career_tracks_id_seq OWNER TO neondb_owner;

--
-- Name: career_tracks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.career_tracks_id_seq OWNED BY public.career_tracks.id;


--
-- Name: courses; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.courses (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    semester integer NOT NULL,
    description text,
    max_score integer DEFAULT 15 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    midterm_max integer DEFAULT 15,
    practical_max integer DEFAULT 15,
    oral_max integer DEFAULT 10,
    CONSTRAINT courses_semester_check CHECK ((semester = ANY (ARRAY[1, 2])))
);


ALTER TABLE public.courses OWNER TO neondb_owner;

--
-- Name: courses_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.courses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.courses_id_seq OWNER TO neondb_owner;

--
-- Name: courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.courses_id_seq OWNED BY public.courses.id;


--
-- Name: grades; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.grades (
    id integer NOT NULL,
    student_id character varying(50),
    course_name character varying(255),
    midterm_score numeric(5,2),
    midterm_status character varying(50) DEFAULT 'pending'::character varying,
    practical_score numeric(5,2),
    practical_status character varying(50) DEFAULT 'pending'::character varying,
    oral_score numeric(5,2),
    oral_status character varying(50) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.grades OWNER TO neondb_owner;

--
-- Name: grades_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.grades_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.grades_id_seq OWNER TO neondb_owner;

--
-- Name: grades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.grades_id_seq OWNED BY public.grades.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    student_id character varying(50),
    title character varying(255) NOT NULL,
    content text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notifications OWNER TO neondb_owner;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO neondb_owner;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: resources; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.resources (
    id integer NOT NULL,
    course_id integer,
    type character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    url text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT resources_type_check CHECK (((type)::text = ANY ((ARRAY['video'::character varying, 'pdf'::character varying, 'summary'::character varying])::text[])))
);


ALTER TABLE public.resources OWNER TO neondb_owner;

--
-- Name: resources_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.resources_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.resources_id_seq OWNER TO neondb_owner;

--
-- Name: resources_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.resources_id_seq OWNED BY public.resources.id;


--
-- Name: roadmap_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.roadmap_items (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    video_url character varying(500),
    order_index integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.roadmap_items OWNER TO neondb_owner;

--
-- Name: roadmap_items_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.roadmap_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roadmap_items_id_seq OWNER TO neondb_owner;

--
-- Name: roadmap_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.roadmap_items_id_seq OWNED BY public.roadmap_items.id;


--
-- Name: roadmap_stages; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.roadmap_stages (
    id integer NOT NULL,
    roadmap_id integer NOT NULL,
    title character varying(100) NOT NULL,
    description text,
    order_index integer NOT NULL,
    required_courses_ids integer[],
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.roadmap_stages OWNER TO neondb_owner;

--
-- Name: roadmap_stages_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.roadmap_stages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roadmap_stages_id_seq OWNER TO neondb_owner;

--
-- Name: roadmap_stages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.roadmap_stages_id_seq OWNED BY public.roadmap_stages.id;


--
-- Name: roadmap_tasks; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.roadmap_tasks (
    id integer NOT NULL,
    track_id integer,
    title character varying(255) NOT NULL,
    description text,
    order_index integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.roadmap_tasks OWNER TO neondb_owner;

--
-- Name: roadmap_tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.roadmap_tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roadmap_tasks_id_seq OWNER TO neondb_owner;

--
-- Name: roadmap_tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.roadmap_tasks_id_seq OWNED BY public.roadmap_tasks.id;


--
-- Name: roadmaps; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.roadmaps (
    id integer NOT NULL,
    title character varying(100) NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    icon character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.roadmaps OWNER TO neondb_owner;

--
-- Name: roadmaps_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.roadmaps_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roadmaps_id_seq OWNER TO neondb_owner;

--
-- Name: roadmaps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.roadmaps_id_seq OWNED BY public.roadmaps.id;


--
-- Name: student_courses; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.student_courses (
    id integer NOT NULL,
    student_id character varying(50) NOT NULL,
    course_id integer NOT NULL,
    progress_percentage integer DEFAULT 0,
    status character varying(20) DEFAULT 'active'::character varying,
    enrolled_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.student_courses OWNER TO neondb_owner;

--
-- Name: student_courses_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.student_courses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.student_courses_id_seq OWNER TO neondb_owner;

--
-- Name: student_courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.student_courses_id_seq OWNED BY public.student_courses.id;


--
-- Name: students; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.students (
    id character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    level integer DEFAULT 1,
    section integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.students OWNER TO neondb_owner;

--
-- Name: student_grade_summary; Type: VIEW; Schema: public; Owner: neondb_owner
--

CREATE VIEW public.student_grade_summary AS
 SELECT s.id AS student_id,
    s.name AS student_name,
    count(DISTINCT g.course_name) AS courses_graded,
    ((COALESCE(sum(g.midterm_score), (0)::numeric) + COALESCE(sum(g.practical_score), (0)::numeric)) + COALESCE(sum(g.oral_score), (0)::numeric)) AS total_score,
    count(DISTINCT c.id) AS total_courses
   FROM ((public.students s
     LEFT JOIN public.grades g ON (((s.id)::text = (g.student_id)::text)))
     CROSS JOIN public.courses c)
  WHERE (c.semester = 2)
  GROUP BY s.id, s.name;


ALTER VIEW public.student_grade_summary OWNER TO neondb_owner;

--
-- Name: student_roadmap_progress; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.student_roadmap_progress (
    id integer NOT NULL,
    student_id character varying(50) NOT NULL,
    roadmap_id integer NOT NULL,
    current_stage_id integer,
    completed_stage_ids integer[],
    started_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.student_roadmap_progress OWNER TO neondb_owner;

--
-- Name: student_roadmap_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.student_roadmap_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.student_roadmap_progress_id_seq OWNER TO neondb_owner;

--
-- Name: student_roadmap_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.student_roadmap_progress_id_seq OWNED BY public.student_roadmap_progress.id;


--
-- Name: student_task_progress; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.student_task_progress (
    id integer NOT NULL,
    student_id character varying(50),
    task_id integer,
    is_completed boolean DEFAULT false,
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.student_task_progress OWNER TO neondb_owner;

--
-- Name: student_task_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.student_task_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.student_task_progress_id_seq OWNER TO neondb_owner;

--
-- Name: student_task_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.student_task_progress_id_seq OWNED BY public.student_task_progress.id;


--
-- Name: student_users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.student_users (
    id integer NOT NULL,
    student_id character varying(50) NOT NULL,
    password_hash character varying(255) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.student_users OWNER TO neondb_owner;

--
-- Name: student_users_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.student_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.student_users_id_seq OWNER TO neondb_owner;

--
-- Name: student_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.student_users_id_seq OWNED BY public.student_users.id;


--
-- Name: timetable; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.timetable (
    id integer NOT NULL,
    section character varying(10) NOT NULL,
    day_of_week character varying(20) NOT NULL,
    start_time time without time zone,
    end_time time without time zone,
    course_name character varying(255),
    location character varying(255),
    instructor character varying(255),
    type character varying(50) DEFAULT 'Lecture'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.timetable OWNER TO neondb_owner;

--
-- Name: timetable_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.timetable_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.timetable_id_seq OWNER TO neondb_owner;

--
-- Name: timetable_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.timetable_id_seq OWNED BY public.timetable.id;


--
-- Name: announcements id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.announcements ALTER COLUMN id SET DEFAULT nextval('public.announcements_id_seq'::regclass);


--
-- Name: career_tracks id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.career_tracks ALTER COLUMN id SET DEFAULT nextval('public.career_tracks_id_seq'::regclass);


--
-- Name: courses id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.courses ALTER COLUMN id SET DEFAULT nextval('public.courses_id_seq'::regclass);


--
-- Name: grades id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.grades ALTER COLUMN id SET DEFAULT nextval('public.grades_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: resources id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.resources ALTER COLUMN id SET DEFAULT nextval('public.resources_id_seq'::regclass);


--
-- Name: roadmap_items id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.roadmap_items ALTER COLUMN id SET DEFAULT nextval('public.roadmap_items_id_seq'::regclass);


--
-- Name: roadmap_stages id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.roadmap_stages ALTER COLUMN id SET DEFAULT nextval('public.roadmap_stages_id_seq'::regclass);


--
-- Name: roadmap_tasks id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.roadmap_tasks ALTER COLUMN id SET DEFAULT nextval('public.roadmap_tasks_id_seq'::regclass);


--
-- Name: roadmaps id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.roadmaps ALTER COLUMN id SET DEFAULT nextval('public.roadmaps_id_seq'::regclass);


--
-- Name: student_courses id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.student_courses ALTER COLUMN id SET DEFAULT nextval('public.student_courses_id_seq'::regclass);


--
-- Name: student_roadmap_progress id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.student_roadmap_progress ALTER COLUMN id SET DEFAULT nextval('public.student_roadmap_progress_id_seq'::regclass);


--
-- Name: student_task_progress id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.student_task_progress ALTER COLUMN id SET DEFAULT nextval('public.student_task_progress_id_seq'::regclass);


--
-- Name: student_users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.student_users ALTER COLUMN id SET DEFAULT nextval('public.student_users_id_seq'::regclass);


--
-- Name: timetable id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.timetable ALTER COLUMN id SET DEFAULT nextval('public.timetable_id_seq'::regclass);


--
-- Data for Name: announcements; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.announcements (id, title, content, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: career_tracks; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.career_tracks (id, name, description, is_primary, created_at, updated_at) FROM stdin;
1	AI Engineer	Master the architecture of intelligent systems, from neural networks to large language models.	t	2026-04-04 06:49:30.751403	2026-04-04 06:49:30.751403
2	Data Scientist	Uncover insights through advanced statistical modeling and machine learning.	f	2026-04-04 06:49:30.751403	2026-04-04 06:49:30.751403
3	ML Engineer	Build and deploy production-ready machine learning systems.	f	2026-04-04 06:49:30.751403	2026-04-04 06:49:30.751403
4	Data Analyst	Translate complex data into actionable business intelligence.	f	2026-04-04 06:49:30.751403	2026-04-04 06:49:30.751403
5	Cyber Security	Master the fundamentals of protecting networks, systems, and data.	f	2026-04-04 06:49:30.751403	2026-04-04 06:49:30.751403
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.courses (id, name, semester, description, max_score, created_at, updated_at, midterm_max, practical_max, oral_max) FROM stdin;
1	Programming 2	2	Advanced programming concepts with Dr. Mahmoud El-Namouly	40	2026-04-04 06:49:30.668126	2026-04-04 12:52:43.125485	15	15	10
2	Discrete Mathematics	2	Mathematical structures with Dr. Abduallah Gamal	40	2026-04-04 06:49:30.668126	2026-04-04 12:52:43.125485	15	15	10
3	Digital Logic Design	2	Digital circuits with Dr. Khaled Hosny	40	2026-04-04 06:49:30.668126	2026-04-04 12:52:43.125485	15	15	10
4	Operation Research	2	Optimization techniques with Dr. Sherine Zaki	40	2026-04-04 06:49:30.668126	2026-04-04 12:52:43.125485	15	15	10
5	Social Ethical	2	Ethics in computing with Dr. Aml Zaki	40	2026-04-04 06:49:30.668126	2026-04-04 12:52:43.125485	15	15	10
6	Mathematics 2	2	Advanced mathematics with Dr. Aml Farouk	40	2026-04-04 06:49:30.668126	2026-04-04 12:52:43.125485	15	15	10
\.


--
-- Data for Name: grades; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.grades (id, student_id, course_name, midterm_score, midterm_status, practical_score, practical_status, oral_score, oral_status, created_at, updated_at) FROM stdin;
5	29212025100727	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
6	29212025100836	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
7	29212025100731	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
8	29212025100720	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
9	29212025100721	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
10	29212025100799	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
11	29212025100722	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
12	29212025100800	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
13	29212025100801	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
14	29212025100802	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
15	29212025100980	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
16	29212025100723	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
17	29212025100803	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
18	29212025200725	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
19	29212025200724	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
20	29212025200726	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
21	29212025100804	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
22	29212025100728	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
23	29212025100805	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
24	29212025200729	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
25	29212025200730	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
26	29212025200756	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
27	29212025100806	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
28	29212025100781	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
29	29212025100782	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
30	29212025200783	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
31	29212025200784	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
32	29212025100807	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
33	29212025100790	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
34	29212025200794	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
35	29212025200808	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
36	29212025200809	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
37	29212025200795	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
38	29212025200796	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
39	29212025200797	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
40	29212025200810	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
41	29212025100811	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
42	29212025100798	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
43	29212025100732	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
44	29212025100733	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
45	29212025100734	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
46	29212025200735	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
47	29212025100812	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
48	29212025100813	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
49	29212025200736	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
50	29212025100737	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
51	29212025100738	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
52	29212025100814	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
53	29212025200739	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
54	29212025200740	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
55	29212025200741	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
56	29212025100793	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
57	29212025100744	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
58	29212025100742	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
59	29212025100837	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
60	29212025100743	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
61	29212025100815	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
62	29212025100816	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
63	29212025100835	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
64	29212025100745	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
65	29212025100789	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
66	29212025100838	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
67	29212025100817	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
68	29212025100746	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
69	29212025100747	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
70	29212025100818	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
71	29212025100748	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
72	29212025100749	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
73	29212025100834	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
74	29212025100819	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
75	29212025100820	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
76	29212025100821	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
77	29212025100822	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
78	29212025100823	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
79	29212025100750	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
80	29212025100824	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
81	29212025200751	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
82	29212025200825	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
83	29212025100775	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
84	29212025100833	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
85	29212025100752	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
86	29212025100832	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
87	29212025100753	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
88	29212025100754	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
89	29212025100840	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
90	29212025100755	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
91	29212025100757	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
92	29212025100758	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
93	29212025100792	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
94	29212025100826	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
95	29212025100759	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
96	29212025100841	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
97	29212025100760	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
98	29212025100761	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
99	29212025100762	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
100	29212025100763	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
101	29212025100764	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
102	29212025100765	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
103	29212025200766	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
104	29212025200767	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
105	29212025100768	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
106	29212025100769	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
107	29212025100770	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
108	29212025100771	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
109	29212025100772	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
110	29212025200827	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
111	29212025200774	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
112	29212025200773	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
113	29212025100828	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
114	29212025200776	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
115	29212025100829	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
116	29212025200791	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
117	29212025200777	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
118	29212025100778	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
119	29212025200779	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
120	29212025200830	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
121	29212025200780	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
122	29212025100785	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
123	29212025100788	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
124	29212025100831	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
125	29212025100786	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
126	29212025100787	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
127	29212025200715	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
128	29212025100436	Operation Research	9.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
129	29212025100437	Operation Research	9.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
130	29212025100968	Operation Research	10.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
131	29212025100438	Operation Research	12.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
132	29212025100439	Operation Research	10.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
133	29212025100440	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
134	29212025100716	Operation Research	12.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
135	29212025100441	Operation Research	12.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
136	29212025100442	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
137	29212025100443	Operation Research	12.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
138	29212025100717	Operation Research	11.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
139	29212025100718	Operation Research	11.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
140	29212025100444	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
141	29212025100445	Operation Research	14.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
142	29212025100447	Operation Research	8.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
143	29212025100448	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
144	29212025100449	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
145	29212025100719	Operation Research	12.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
146	29212025100979	Operation Research	9.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
147	29212025100450	Operation Research	10.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
148	29212025100451	Operation Research	11.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
149	29212025100452	Operation Research	10.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
150	29212025100453	Operation Research	13.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
151	29212025100645	Operation Research	14.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
152	29212025100454	Operation Research	10.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
153	29212025100455	Operation Research	9.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
154	29212025100456	Operation Research	12.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
155	29212025100457	Operation Research	12.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
156	29212025100646	Operation Research	12.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
157	29212025100458	Operation Research	9.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
158	29212025100459	Operation Research	10.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
159	29212025100460	Operation Research	10.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
160	29212025100461	Operation Research	15.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
161	29212025100647	Operation Research	9.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
162	29212025100462	Operation Research	11.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
163	29212025100648	Operation Research	9.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
164	29212025100463	Operation Research	15.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
165	29212025100704	Operation Research	9.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
166	29212025100464	Operation Research	8.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
167	29212025100465	Operation Research	8.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
168	29212025100477	Operation Research	15.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
169	29212025100467	Operation Research	15.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
170	29212025100468	Operation Research	10.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
171	29212025100965	Operation Research	14.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
172	29212025100970	Operation Research	14.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
173	29212025100469	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
174	29212025100470	Operation Research	9.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
175	29212025200703	Operation Research	15.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
176	29212025100471	Operation Research	8.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
177	29212025100649	Operation Research	8.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
178	29212025100650	Operation Research	9.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
179	29212025100966	Operation Research	15.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
180	29212025100472	Operation Research	9.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
181	29212025200473	Operation Research	12.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
182	29212025100699	Operation Research	9.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
183	29212025100651	Operation Research	9.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
184	29212025100652	Operation Research	10.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
185	29212025200474	Operation Research	14.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
186	29212025200475	Operation Research	9.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
187	29212025100967	Operation Research	11.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
188	29212025100476	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
189	29212025100478	Operation Research	9.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
190	29212025200653	Operation Research	15.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
191	29212025200702	Operation Research	10.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
192	29212025200971	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
193	29212025200977	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
194	29212025100479	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
195	29212025100480	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
196	29212025100481	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
197	29212025100482	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
198	29212025100705	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
199	29212025200483	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
200	29212025200484	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
201	29212025100654	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
202	29212025100485	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
203	29212025100486	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
204	29212025100487	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
205	29212025100655	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
206	29212025100656	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
207	29212025100488	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
208	29212025200489	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
209	29212025100491	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
210	29212025100490	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
211	29212025200644	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
212	29212025200706	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
213	29212025200492	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
214	29212025100657	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
215	29212025100658	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
216	29212025200659	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
217	29212025200493	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
218	29212025200494	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
219	29212025100495	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
220	29212025200496	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
221	29212025100497	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
222	29212025100660	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
223	29212025100498	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
224	29212025100499	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
225	29212025100500	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
226	29212025100501	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
227	29212025100502	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
228	29212025100503	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
229	29212025200700	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
230	29212025200504	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
231	29212025200505	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
232	29212025200506	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
233	29212025200507	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
234	29212025100508	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
235	29212025100509	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
236	29212025100707	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
237	29212025200510	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
238	29212025100661	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
239	29212025200511	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
240	29212025100662	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
241	29212025200512	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
242	29212025200663	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
243	29212025200513	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
244	29212025200708	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
245	29212025200514	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
246	29212025200515	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
247	29212025100516	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
248	29212025100519	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
249	29212025100520	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
250	29212025100664	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
251	29212025100643	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
252	29212025100517	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
253	29212025100640	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
254	29212025100521	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
255	29212025100522	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
256	29212025100978	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
257	29212025100523	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
258	29212025100665	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
259	29212025100524	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
260	29212025100525	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
261	29212025100518	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
262	29212025100526	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
263	29212025100527	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
264	29212025100528	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
265	29212025100666	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
266	29212025100529	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
267	29212025100530	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
268	29212025100531	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
269	29212025100532	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
270	29212025100533	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
271	29212025100709	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
272	29212025100534	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
273	29212025100535	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
274	29212025100536	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
275	29212025100537	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
276	29212025100538	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
277	29212025100539	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
278	29212025100540	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
279	29212025100710	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
280	29212025100711	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
281	29212025100541	Operation Research	8.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
282	29212025100542	Operation Research	8.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
283	29212025100543	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
284	29212025100544	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
285	29212025100545	Operation Research	8.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
286	29212025100641	Operation Research	9.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
287	29212025100546	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
288	29212025100547	Operation Research	13.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
289	29212025100548	Operation Research	11.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
290	29212025100667	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
291	29212025100549	Operation Research	13.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
292	29212025100550	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
293	29212025200551	Operation Research	9.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
294	29212025100668	Operation Research	9.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
295	29212025100552	Operation Research	9.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
296	29212025100553	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
297	29212025100554	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
298	29212025100555	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
299	29212025100961	Operation Research	9.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
300	29212025100712	Operation Research	10.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
301	29212025100614	Operation Research	8.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
302	29212025100615	Operation Research	9.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
303	29212025200556	Operation Research	10.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
304	29212025100972	Operation Research	13.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
305	29212025100557	Operation Research	7.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
306	29212025100558	Operation Research	10.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
307	29212025100559	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
308	29212025100669	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
309	29212025100670	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
310	29212025100560	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
311	29212025100561	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
312	29212025100562	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
313	29212025100671	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
314	29212025100701	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
315	29212025100563	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
316	29212025100672	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
317	29212025100564	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
318	29212025100565	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
319	29212025100566	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
320	29212025100567	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
321	29212025100568	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
322	29212025100673	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
323	29212025100569	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
324	29212025100570	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
325	29212025100674	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
326	29212025100962	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
327	29212025100713	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
328	29212025100571	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
329	29212025100572	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
330	29212025100573	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
331	29212025100574	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
332	29212025100675	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
333	29212025100575	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
334	29212025100576	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
335	29212025100676	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
336	29212025100577	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
337	29212025100578	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
338	29212025100579	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
339	29212025100964	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
340	29212025100580	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
341	29212025100642	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
342	29212025100581	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
343	29212025100582	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
344	29212025100583	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
345	29212025100584	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
346	29212025100677	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
347	29212025100585	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
348	29212025100586	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
349	29212025100587	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
350	29212025100588	Operation Research	8.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
351	29212025100589	Operation Research	10.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
352	29212025100590	Operation Research	9.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
353	29212025100591	Operation Research	8.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
354	29212025100593	Operation Research	9.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
355	29212025100594	Operation Research	8.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
356	29212025100595	Operation Research	9.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
357	29212025100596	Operation Research	11.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
358	29212025100597	Operation Research	10.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
359	29212025100678	Operation Research	15.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
360	29212025100598	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
361	29212025100599	Operation Research	10.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
362	29212025100679	Operation Research	14.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
363	29212025100680	Operation Research	8.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
364	29212025200600	Operation Research	14.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
365	29212025200963	Operation Research	13.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
366	29212025200601	Operation Research	12.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
367	29212025100602	Operation Research	8.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
368	29212025100603	Operation Research	10.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
369	29212025100976	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
370	29212025100604	Operation Research	9.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
371	29212025100605	Operation Research	12.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
372	29212025100606	Operation Research	12.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
373	29212025100607	Operation Research	11.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
374	29212025100608	Operation Research	15.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
375	29212025100681	Operation Research	6.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
376	29212025200609	Operation Research	12.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
377	29212025100610	Operation Research	13.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
378	29212025200611	Operation Research	8.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
379	29212025200612	Operation Research	10.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
380	29212025100638	Operation Research	8.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
381	29212025100613	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
382	29212025200975	Operation Research	14.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
383	29212025200682	Operation Research	13.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
384	29212025200683	Operation Research	12.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
385	29212025200684	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
386	29212025100616	Operation Research	13.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
387	29212025200685	Operation Research	10.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
388	29212025200617	Operation Research	12.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
389	29212025200618	Operation Research	12.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
390	29212025100619	Operation Research	12.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
391	29212025200686	Operation Research	12.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
392	29212025100620	Operation Research	7.00	completed	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
393	29212025100621	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
394	29212025100622	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
395	29212025100623	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
396	29212025100624	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
397	29212025100625	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
398	29212025100687	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
399	29212025100626	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
400	29212025100627	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
401	29212025100688	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
402	29212025100628	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
403	29212025100629	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
404	29212025100630	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
405	29212025100689	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
406	29212025100690	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
407	29212025100631	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
408	29212025100691	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
409	29212025100692	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
410	29212025100632	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
411	29212025100633	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
412	29212025100634	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
413	29212025100635	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
414	29212025100636	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
415	29212025100693	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
416	29212025100637	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
417	29212025100694	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
418	29212025100695	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
419	29212025100696	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
420	29212025100697	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
421	29212025100698	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
422	29212025100714	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
423	29212025100639	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
424	29212025100969	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
425	29212025100857	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
426	29212025100936	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
427	29212025100959	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
428	29212025100842	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
429	29212025100843	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
430	29212025100844	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
431	29212025100960	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
432	29212025200845	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
433	29212025200934	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
434	29212025200846	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
435	29212025200847	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
436	29212025200848	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
437	29212025200849	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
438	29212025200935	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
439	29212025200850	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
440	29212025200851	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
441	29212025100852	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
442	29212025100937	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
443	29212025200938	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
444	29212025100853	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
445	29212025100854	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
446	29212025200855	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
447	29212025200939	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
448	29212025200856	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
449	29212025200858	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
450	29212025200859	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
451	29212025200933	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
452	29212025100860	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
453	29212025200861	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
454	29212025200862	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
455	29212025200863	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
456	29212025100864	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
457	29212025200865	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
458	29212025100866	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
459	29212025200867	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
460	29212025200954	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
461	29212025200957	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
462	29212025200868	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
463	29212025200940	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
464	29212025200869	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
465	29212025200870	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
466	29212025200871	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
467	29212025200932	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
468	29212025200872	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
469	29212025200873	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
470	29212025200874	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
471	29212025100875	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
472	29212025100955	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
473	29212025100876	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
474	29212025100877	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
475	29212025200878	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
476	29212025200941	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
477	29212025200879	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
478	29212025200880	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
479	29212025200884	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
480	29212025200881	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
481	29212025200882	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
482	29212025200883	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
483	29212025200942	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
484	29212025200885	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
485	29212025200886	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
486	29212025200887	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
487	29212025100888	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
488	29212025200943	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
489	29212025200889	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
490	29212025200890	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
491	29212025200930	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
492	29212025100958	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
493	29212025100891	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
494	29212025100892	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
495	29212025200893	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
496	29212025100894	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
497	29212025200895	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
498	29212025100896	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
499	29212025200897	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
500	29212025200898	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
501	29212025100917	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
502	29212025100899	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
503	29212025100900	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
504	29212025100944	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
505	29212025100901	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
506	29212025100945	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
507	29212025100902	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
508	29212025100946	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
509	29212025100903	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
510	29212025100947	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
511	29212025100904	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
512	29212025100905	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
513	29212025100948	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
514	29212025100906	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
515	29212025100907	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
516	29212025100908	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
517	29212025100956	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
518	29212025100909	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
519	29212025100910	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
520	29212025200911	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
521	29212025200912	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
522	29212025200949	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
523	29212025100950	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
524	29212025100913	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
525	29212025100914	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
526	29212025200931	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
527	29212025200915	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
528	29212025200916	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
529	29212025200918	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
530	29212025200951	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
531	29212025200919	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
532	29212025200920	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
533	29212025200921	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
534	29212025200922	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
535	29212025200923	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
536	29212025200952	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
537	29212025100924	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
538	29212025100953	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
539	29212025100925	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
540	29212025100926	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
541	29212025100927	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
542	29212025100928	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
543	29212025100929	Operation Research	\N	pending	\N	pending	\N	pending	2026-04-04 08:26:16.341693	2026-04-04 09:36:33.069215
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.notifications (id, student_id, title, content, is_read, created_at, updated_at) FROM stdin;
2	\N	New Research Opportunity: AI Ethics Lab	The Faculty of CI is inviting students to participate in the upcoming AI Ethics research project.	t	2026-04-04 06:49:31.090207	2026-04-04 06:49:31.090207
1	\N	Final Exam Schedule Published	The final examination schedule for the Fall 2024 semester is now available. Please review your dates carefully.	t	2026-04-04 06:49:31.090207	2026-04-04 06:49:31.090207
4	\N	🎉 Welcome to Academic Portal	Welcome to the new academic portal. Check your grades and timetable!	f	2026-04-04 14:19:40.472194	2026-04-04 14:19:40.472194
5	\N	📢 Final Exam Schedule	Final exams will start next month. Prepare well!	f	2026-04-04 14:19:40.472194	2026-04-04 14:19:40.472194
6	2021001	📝 Grade Posted	Your grade for Programming 2 has been posted. Check your grades page.	f	2026-04-04 14:19:40.472194	2026-04-04 14:19:40.472194
\.


--
-- Data for Name: resources; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.resources (id, course_id, type, title, url, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: roadmap_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.roadmap_items (id, title, description, video_url, order_index, created_at, updated_at) FROM stdin;
4	DevOps & Cloud Engineering	Master the art of automating software delivery. Learn Linux administration, Docker containerization, Kubernetes orchestration, and Infrastructure as Code (IaC) with Terraform and AWS.	https://youtu.be/FoTiVEbPLP0?si=HRScN_BH1T_zAiAZ	4	2026-04-02 20:31:07.03624	2026-04-02 20:31:07.03624
1	Artificial Intelligence & Data Science	Explore the world of data-driven decision making. Learn Python for data analysis, Machine Learning algorithms, Deep Learning, and how to build intelligent predictive models.	https://www.youtube.com/embed/ILrYwyPd1Dc	1	2026-04-02 09:31:59.185835	2026-04-02 20:37:34.59592
2	Web Development Basics	HTML, CSS, and JavaScript fundamentals.	https://www.youtube.com/embed/MzouYpxPl0Y	2	2026-04-02 09:31:59.185835	2026-04-02 20:38:21.60507
3	Database Design	Understanding relational databases and SQL.	https://www.youtube.com/embed/GBeWKa1Lc6I	3	2026-04-02 09:31:59.185835	2026-04-02 20:39:06.360911
5	Cyber Security	Master the fundamentals of protecting networks, systems, and data from digital attacks. Covers Network Security, Ethical Hacking, Incident Response, and Governance, Risk, and Compliance (GRC) frameworks.	https://www.youtube.com/embed/Asxu8gO1Jt4	5	2026-04-02 20:44:14.400742	2026-04-02 20:44:14.400742
\.


--
-- Data for Name: roadmap_stages; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.roadmap_stages (id, roadmap_id, title, description, order_index, required_courses_ids, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: roadmap_tasks; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.roadmap_tasks (id, track_id, title, description, order_index, created_at, updated_at) FROM stdin;
1	1	Python Programming	Master Python fundamentals, data structures, and OOP concepts	1	2026-04-04 06:49:30.8357	2026-04-04 06:49:30.8357
2	1	Linear Algebra	Understand vectors, matrices, and linear transformations	2	2026-04-04 06:49:30.8357	2026-04-04 06:49:30.8357
3	1	Data Structures	Learn arrays, linked lists, trees, and graphs	3	2026-04-04 06:49:30.8357	2026-04-04 06:49:30.8357
4	1	Supervised Learning	Implement regression and classification algorithms	4	2026-04-04 06:49:30.8357	2026-04-04 06:49:30.8357
5	1	Unsupervised Learning	Master clustering and dimensionality reduction	5	2026-04-04 06:49:30.8357	2026-04-04 06:49:30.8357
6	1	Deep Learning Fundamentals	Understand neural networks and backpropagation	6	2026-04-04 06:49:30.8357	2026-04-04 06:49:30.8357
7	1	LLMs & Transformers	Fine-tune large language models for specific tasks	7	2026-04-04 06:49:30.8357	2026-04-04 06:49:30.8357
8	1	Python Programming	Master Python fundamentals, data structures, and OOP concepts	1	2026-04-04 06:52:01.371433	2026-04-04 06:52:01.371433
9	1	Linear Algebra	Understand vectors, matrices, and linear transformations	2	2026-04-04 06:52:01.371433	2026-04-04 06:52:01.371433
10	1	Data Structures	Learn arrays, linked lists, trees, and graphs	3	2026-04-04 06:52:01.371433	2026-04-04 06:52:01.371433
11	1	Supervised Learning	Implement regression and classification algorithms	4	2026-04-04 06:52:01.371433	2026-04-04 06:52:01.371433
12	1	Unsupervised Learning	Master clustering and dimensionality reduction	5	2026-04-04 06:52:01.371433	2026-04-04 06:52:01.371433
13	1	Deep Learning Fundamentals	Understand neural networks and backpropagation	6	2026-04-04 06:52:01.371433	2026-04-04 06:52:01.371433
14	1	LLMs & Transformers	Fine-tune large language models for specific tasks	7	2026-04-04 06:52:01.371433	2026-04-04 06:52:01.371433
15	1	Python Programming	Master Python fundamentals, data structures, and OOP concepts	1	2026-04-04 07:35:33.395146	2026-04-04 07:35:33.395146
16	1	Linear Algebra	Understand vectors, matrices, and linear transformations	2	2026-04-04 07:35:33.395146	2026-04-04 07:35:33.395146
17	1	Data Structures	Learn arrays, linked lists, trees, and graphs	3	2026-04-04 07:35:33.395146	2026-04-04 07:35:33.395146
18	1	Supervised Learning	Implement regression and classification algorithms	4	2026-04-04 07:35:33.395146	2026-04-04 07:35:33.395146
19	1	Unsupervised Learning	Master clustering and dimensionality reduction	5	2026-04-04 07:35:33.395146	2026-04-04 07:35:33.395146
20	1	Deep Learning Fundamentals	Understand neural networks and backpropagation	6	2026-04-04 07:35:33.395146	2026-04-04 07:35:33.395146
21	1	LLMs & Transformers	Fine-tune large language models for specific tasks	7	2026-04-04 07:35:33.395146	2026-04-04 07:35:33.395146
\.


--
-- Data for Name: roadmaps; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.roadmaps (id, title, description, is_active, icon, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: student_courses; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.student_courses (id, student_id, course_id, progress_percentage, status, enrolled_at, updated_at) FROM stdin;
\.


--
-- Data for Name: student_roadmap_progress; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.student_roadmap_progress (id, student_id, roadmap_id, current_stage_id, completed_stage_ids, started_at, updated_at) FROM stdin;
\.


--
-- Data for Name: student_task_progress; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.student_task_progress (id, student_id, task_id, is_completed, completed_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: student_users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.student_users (id, student_id, password_hash, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.students (id, name, password_hash, level, section, created_at, updated_at) FROM stdin;
29212025100836	ابراهيم محمود ابراهيم محمد ابراهيم شرف	123456	1	\N	2026-04-04 08:21:54.783318	2026-04-04 13:38:22.064774
29212025100731	احمد السيد عبدالعزيز احمد نصر الدين	123456	1	\N	2026-04-04 08:21:54.999324	2026-04-04 13:38:22.218473
29212025100720	احمد تامر فكري جمعه محمد	123456	1	\N	2026-04-04 08:21:55.215271	2026-04-04 13:38:22.371383
29212025100721	احمد حسام محمد عبدالحميد عبدالحميد	123456	1	\N	2026-04-04 08:21:55.433266	2026-04-04 13:38:22.52452
29212025100799	احمد سامح كمال عبدالسﻼم الشامي	123456	1	\N	2026-04-04 08:21:55.649946	2026-04-04 13:38:22.677401
29212025100722	احمد محمد احمد محمد احمد عاشور	123456	1	\N	2026-04-04 08:21:55.865795	2026-04-04 13:38:22.830442
29212025100800	احمد محمود احمد مرسي علي	123456	1	\N	2026-04-04 08:21:56.082298	2026-04-04 13:38:22.983439
29212025100801	احمد محمود عبدالعزيز عرفه السبيعي	123456	1	\N	2026-04-04 08:21:56.29793	2026-04-04 13:38:23.136303
29212025100980	احمد وليد طه السيد	123456	1	\N	2026-04-04 08:21:56.733297	2026-04-04 13:38:23.443606
29212025100723	ارميا ايمن ماهر توفيق بولس	123456	1	\N	2026-04-04 08:21:56.949049	2026-04-04 13:38:23.596606
29212025100803	اسامه محمد عبدالرحمن حسن عبدالرحمن	123456	1	\N	2026-04-04 08:21:57.164331	2026-04-04 13:38:23.749486
29212025200725	اﻻء عماد عبدالسﻼم عبدالعاطي	123456	1	\N	2026-04-04 08:21:57.381489	2026-04-04 13:38:23.902448
29212025200724	اﻻء عماد عبدالفتاح سليمان حمد محمد	123456	1	\N	2026-04-04 08:21:57.597481	2026-04-04 13:38:24.055522
29212025200726	اﻻء محمد عبدﷲ احمد محمد	123456	1	\N	2026-04-04 08:21:57.814322	2026-04-04 13:38:24.208461
29212025100804	ايمن اشرف عاشور عبدالنبي	123456	1	\N	2026-04-04 08:21:58.030437	2026-04-04 13:38:24.362043
29212025100728	بﻼل عرفه احمد بيومي علي	123456	1	\N	2026-04-04 08:21:58.246004	2026-04-04 13:38:24.515256
29212025100805	تادرس مايكل منير الياس ابراهيم	123456	1	\N	2026-04-04 08:21:58.462899	2026-04-04 13:38:24.668368
29212025200729	تسنيم ماهر عبدالرحمن نصر ﷲ عبدالحميد	123456	1	\N	2026-04-04 08:21:58.679058	2026-04-04 13:38:24.822014
29212025200730	جنا لطفي امين موافي السيد	123456	1	\N	2026-04-04 08:21:58.894082	2026-04-04 13:38:24.975059
29212025200756	جني اسماعيل محمد الطيب السيد عطيه غيث	123456	1	\N	2026-04-04 08:21:59.110325	2026-04-04 13:38:25.128129
29212025100806	حامد وائل حامد محمد احمد	123456	1	\N	2026-04-04 08:21:59.325431	2026-04-04 13:38:25.281564
29212025100781	حسام محمد سيد عبدالرحمن ابراهيم	123456	1	\N	2026-04-04 08:21:59.541489	2026-04-04 13:38:25.434748
29212025100782	حسن سامح حسن عبدالباقي طلحه	123456	1	\N	2026-04-04 08:21:59.801473	2026-04-04 13:38:25.587697
29212025200783	حﻼ السيد صالح رمضان محمد	123456	1	\N	2026-04-04 08:22:00.017109	2026-04-04 13:38:25.740712
29212025200784	حنين احمد عبداللطيف الشافعي	123456	1	\N	2026-04-04 08:22:00.232292	2026-04-04 13:38:25.893737
29212025100807	خالد السيد حسن محمد السيد	123456	1	\N	2026-04-04 08:22:00.448342	2026-04-04 13:38:26.047023
29212025100790	خالد محمد عبدالمعطي سليم حمزه	123456	1	\N	2026-04-04 08:22:00.663829	2026-04-04 13:38:26.200085
29212025200794	خديجه عبدالفتاح فايز عبدالفتاح فرج	123456	1	\N	2026-04-04 08:22:00.879283	2026-04-04 13:38:26.353596
29212025200808	خلود العزب حامد السيد عطيه	123456	1	\N	2026-04-04 08:22:01.094387	2026-04-04 13:38:26.506443
29212025200809	دنيا عﻼء عبدﷲ موسي مصطفي	123456	1	\N	2026-04-04 08:22:01.309543	2026-04-04 13:38:26.659607
29212025200795	رحمه وليد مجدي حسن سعد	123456	1	\N	2026-04-04 08:22:01.527207	2026-04-04 13:38:26.812747
29212025200796	رقيه ربيع برعي عامر برعي	123456	1	\N	2026-04-04 08:22:01.743314	2026-04-04 13:38:26.96556
29212025200797	روان ايهاب رجب محمود مردن	123456	1	\N	2026-04-04 08:22:01.960156	2026-04-04 13:38:27.118308
29212025200810	روضه محمود جمعه ابراهيم جمعه	123456	1	\N	2026-04-04 08:22:02.176686	2026-04-04 13:38:27.271957
29212025100811	زياد احمد السيد محمد حجر	123456	1	\N	2026-04-04 08:22:02.391747	2026-04-04 13:38:27.425103
29212025100798	زياد السيد مصلحي محمد موسي	123456	1	\N	2026-04-04 08:22:02.607255	2026-04-04 13:38:27.577863
29212025100733	زياد محمد شاهين محمد علي	123456	1	\N	2026-04-04 08:22:03.054597	2026-04-04 13:38:27.884979
29212025100734	زياد محمد فاروق محمود ابراهيم	123456	1	\N	2026-04-04 08:22:03.270158	2026-04-04 13:38:28.037968
29212025100744	عبدالرؤف محمد عبدالرؤف حسن ابوالخير	123456	1	\N	2026-04-04 08:22:05.857971	2026-04-04 13:38:29.876812
29212025100742	عبدالرحمن سامح فتحي علي السيد الهلوتي	123456	1	\N	2026-04-04 08:22:06.072981	2026-04-04 13:38:30.029662
29212025100837	عبدالرحمن محمد السيد علي السيد احمد	123456	1	\N	2026-04-04 08:22:06.288174	2026-04-04 13:38:30.18272
29212025100743	عبدالرحمن وليد محمد عادل عبدالظيم بركات	123456	1	\N	2026-04-04 08:22:06.50336	2026-04-04 13:38:30.335772
29212025100815	عبدﷲ جمعه حسيني حسن سليم	123456	1	\N	2026-04-04 08:22:06.718116	2026-04-04 13:38:30.488552
29212025100816	عبدﷲ عادل عبدالحميد عبدالعاطي مجاهد	123456	1	\N	2026-04-04 08:22:06.933328	2026-04-04 13:38:30.644421
29212025100835	عبدﷲ عبدالعزيز عبدﷲ عبدالعزيز	123456	1	\N	2026-04-04 08:22:07.156051	2026-04-04 13:38:30.797367
29212025100745	عبدﷲ محمود حماد فرحان غانم	123456	1	\N	2026-04-04 08:22:07.370617	2026-04-04 13:38:30.950755
29212025100789	علي سامح احمد نجاح عبدالصادق العوضي	123456	1	\N	2026-04-04 08:22:07.585935	2026-04-04 13:38:31.103878
29212025100838	علي ياسر شعبان احمد عيسوي	123456	1	\N	2026-04-04 08:22:07.800776	2026-04-04 13:38:31.256822
29212025100748	عمر ايهاب حسين محمد علي خليل	123456	1	\N	2026-04-04 08:22:08.88024	2026-04-04 13:38:32.0453
29212025100749	عمر سعيد عبدﷲ ابوزيد محمد	123456	1	\N	2026-04-04 08:22:09.0977	2026-04-04 13:38:32.198129
29212025100834	عمر عاطف عبدالعظيم مصطفي	123456	1	\N	2026-04-04 08:22:09.31497	2026-04-04 13:38:32.351533
29212025100820	عمر محمد حمدي ربيع محمد	123456	1	\N	2026-04-04 08:22:09.74907	2026-04-04 13:38:32.657412
29212025100822	عمر محمد محمود عبدالمقصود الجوهري	123456	1	\N	2026-04-04 08:22:10.180505	2026-04-04 13:38:32.964038
29212025100823	عمرو محمد فتحي مصطفي غيطاني	123456	1	\N	2026-04-04 08:22:10.401984	2026-04-04 13:38:33.118585
29212025100750	فارس منصور حليم منصور علي	123456	1	\N	2026-04-04 08:22:10.61813	2026-04-04 13:38:33.27194
29212025100824	كريم احمد شوقي ابراهيم	123456	1	\N	2026-04-04 08:22:10.833601	2026-04-04 13:38:33.425272
29212025200751	لوجين عماد محمد الحسيني المصري المكاوي	123456	1	\N	2026-04-04 08:22:11.049141	2026-04-04 13:38:33.578168
29212025100812	ساهر عادل فؤاد عبدالنور عبدالمﻼك	123456	1	\N	2026-04-04 08:22:03.705084	2026-04-04 13:38:28.345591
29212025100813	سعيد حسن سعيد حمدي علي	123456	1	\N	2026-04-04 08:22:03.920766	2026-04-04 13:38:28.498438
29212025200736	سما سعيد عطيه احمد صالح	123456	1	\N	2026-04-04 08:22:04.135482	2026-04-04 13:38:28.651745
2021001	Ahmed Mohamed	123456	1	1	2026-04-04 08:02:58.916366	2026-04-04 15:08:10.270509
2021002	Sara Khaled	123456	1	2	2026-04-04 08:02:58.916366	2026-04-04 15:08:10.3596
2021005	Youssef Hassan	123456	1	2	2026-04-04 08:02:58.916366	2026-04-04 15:08:10.3596
2021004	Fatima Ali	123456	1	3	2026-04-04 08:02:58.916366	2026-04-04 15:08:10.440622
29212025100737	سمير محمد سمير فوزي طه	123456	1	\N	2026-04-04 08:22:04.350242	2026-04-04 13:38:28.80506
29212025100814	شادي اسﻼم اسماعيل حسين احمد العامودي	123456	1	\N	2026-04-04 08:22:04.781427	2026-04-04 13:38:29.111306
29212025200739	شروق ثروت عطيه عبدالمطلب عطيه	123456	1	\N	2026-04-04 08:22:04.996387	2026-04-04 13:38:29.264268
29212025200740	شهد الشبراوي الشوادفي محمد محمد	123456	1	\N	2026-04-04 08:22:05.211733	2026-04-04 13:38:29.417319
29212025200741	شهد سمير السيد سليمان مرسي	123456	1	\N	2026-04-04 08:22:05.426561	2026-04-04 13:38:29.570865
29212025100793	صبري محمد سرور مباشر محمد	123456	1	\N	2026-04-04 08:22:05.642855	2026-04-04 13:38:29.72387
29212025100817	عماد علي السيد محمد سليمان	123456	1	\N	2026-04-04 08:22:08.015945	2026-04-04 13:38:31.410262
29212025100746	عمار محمود صابر محمد عبداللطيف	123456	1	\N	2026-04-04 08:22:08.231845	2026-04-04 13:38:31.580505
29212025100747	عمار ياسر محمد امين عجاج	123456	1	\N	2026-04-04 08:22:08.447856	2026-04-04 13:38:31.738515
29212025100818	عمر احمد حسن صبحي داود	123456	1	\N	2026-04-04 08:22:08.664123	2026-04-04 13:38:31.892359
29212025200825	ليندا محمد فتحي ابوالفتوح العدوي	123456	1	\N	2026-04-04 08:22:11.264237	2026-04-04 13:38:33.731517
29212025100775	مؤمن محمد سﻼمه محمد ابراهيم	123456	1	\N	2026-04-04 08:22:11.489191	2026-04-04 13:38:33.884823
29212025100833	محمد احمد جمال محمد ابراهيم	123456	1	\N	2026-04-04 08:22:11.705462	2026-04-04 13:38:34.037779
29212025100752	محمد احمد مجدي محمد فؤاد محمد العزالي	123456	1	\N	2026-04-04 08:22:11.920817	2026-04-04 13:38:34.190962
29212025100832	محمد باسم محمد وجيه محمد مكاوي	123456	1	\N	2026-04-04 08:22:12.13609	2026-04-04 13:38:34.343728
29212025100754	محمد حسن فوزي السيد السيدابو سنه	123456	1	\N	2026-04-04 08:22:12.567748	2026-04-04 13:38:34.650051
29212025100840	محمد رامي محمد فاروق احمد	123456	1	\N	2026-04-04 08:22:12.786846	2026-04-04 13:38:34.803646
29212025100755	محمد سامي محمد محروس الزناتي	123456	1	\N	2026-04-04 08:22:13.001863	2026-04-04 13:38:34.956515
29212025100757	محمد سعيد محمد عبدالنبي سالم	123456	1	\N	2026-04-04 08:22:13.217401	2026-04-04 13:38:35.109888
29212025100758	محمد شريف عبده السيد محمد	123456	1	\N	2026-04-04 08:22:13.432856	2026-04-04 13:38:35.263211
29212025100792	محمد عبدالحميد السيد حسن	123456	1	\N	2026-04-04 08:22:13.647845	2026-04-04 13:38:35.417338
29212025100826	محمد محمود مصطفي السيد حسانين	123456	1	\N	2026-04-04 08:22:13.862798	2026-04-04 13:38:35.570244
29212025100759	محمد نادر محمد السعيد محمد اﻻشقر	123456	1	\N	2026-04-04 08:22:14.078763	2026-04-04 13:38:35.723456
29212025100841	محمد ناصر محمد متولي السيد	123456	1	\N	2026-04-04 08:22:14.294155	2026-04-04 13:38:35.876592
29212025100760	محمد هيثم ابراهيم محمود	123456	1	\N	2026-04-04 08:22:14.528342	2026-04-04 13:38:36.029905
29212025100761	محمود امين محمود فهمي	123456	1	\N	2026-04-04 08:22:14.744344	2026-04-04 13:38:36.183428
29212025100762	محمود علي الشحات علي احمد عيسي	123456	1	\N	2026-04-04 08:22:14.959381	2026-04-04 13:38:36.337043
29212025100763	محمود محمد صالح منصور محمد	123456	1	\N	2026-04-04 08:22:15.179061	2026-04-04 13:38:36.490874
29212025100764	محمود محمد صﻼح ابراهيم خليل	123456	1	\N	2026-04-04 08:22:15.394322	2026-04-04 13:38:36.644091
29212025100765	مروان عمرو احمد محمود محمد	123456	1	\N	2026-04-04 08:22:15.609539	2026-04-04 13:38:36.797181
29212025200766	مريم ممدوح ابراهيم رزق فرحان	123456	1	\N	2026-04-04 08:22:15.837864	2026-04-04 13:38:36.950064
29212025200767	مريم وليد محمود محمد هاشم	123456	1	\N	2026-04-04 08:22:16.053641	2026-04-04 13:38:37.103065
29212025100768	مصطفي ايمن رمضان ابوالفتوح	123456	1	\N	2026-04-04 08:22:16.268523	2026-04-04 13:38:37.25602
29212025100769	مصطفي محمد مصطفي شحاته مصطفي	123456	1	\N	2026-04-04 08:22:16.484423	2026-04-04 13:38:37.408953
29212025100771	معاذ ابرهيم رمضان عباس محمد نجم	123456	1	\N	2026-04-04 08:22:16.914152	2026-04-04 13:38:37.717633
29212025100772	معاذ عمر احمد محمد محمد	123456	1	\N	2026-04-04 08:22:17.129105	2026-04-04 13:38:37.870695
29212025200827	ملك احمد محمود محمد محمد عماره	123456	1	\N	2026-04-04 08:22:17.343787	2026-04-04 13:38:38.023762
29212025200774	منه احمد عبدالباري عبدالباري محمد	123456	1	\N	2026-04-04 08:22:17.559057	2026-04-04 13:38:38.176814
29212025200773	منه ﷲ هاني شعبان محمود سالم	123456	1	\N	2026-04-04 08:22:17.774141	2026-04-04 13:38:38.329677
29212025100828	مهند حازم محمود بريشه	123456	1	\N	2026-04-04 08:22:17.989242	2026-04-04 13:38:38.482824
29212025200776	ميار خاطر ممدوح محمد خاطر	123456	1	\N	2026-04-04 08:22:18.204854	2026-04-04 13:38:38.635708
29212025100829	نصر علي السعيد عباس فرج	123456	1	\N	2026-04-04 08:22:18.419954	2026-04-04 13:38:38.788888
29212025200791	نهي سامح ابراهيم عبدالعزيز حسن	123456	1	\N	2026-04-04 08:22:18.634775	2026-04-04 13:38:38.942166
29212025200777	نور عمرو عبدالرحمن عبدالمحسن محمد	123456	1	\N	2026-04-04 08:22:18.850299	2026-04-04 13:38:39.095027
29212025100778	نورالدين اسماعيل السيد احمد محمد	123456	1	\N	2026-04-04 08:22:19.065623	2026-04-04 13:38:39.247969
29212025200779	هاجر اسامه عبدالغني عبدالغني	123456	1	\N	2026-04-04 08:22:19.280808	2026-04-04 13:38:39.401374
29212025200830	هدير محمود سالم سيد حسن	123456	1	\N	2026-04-04 08:22:19.496495	2026-04-04 13:38:39.554535
29212025200780	يارا حسن محمد محروس عبدالدايم	123456	1	\N	2026-04-04 08:22:19.71218	2026-04-04 13:38:39.707289
29212025100785	يحي عمرو حسين عبدالفتاح امام	123456	1	\N	2026-04-04 08:22:19.927705	2026-04-04 13:38:39.860385
29212025100831	يوسف حسام سمير بباوي	123456	1	\N	2026-04-04 08:22:20.357844	2026-04-04 13:38:40.16743
29212025100786	يوسف عبدالرحمن سيد عبدالفتاح	123456	1	\N	2026-04-04 08:22:20.572862	2026-04-04 13:38:40.320699
29212025100787	يوسف محمد حسين محمد	123456	1	\N	2026-04-04 08:22:20.788207	2026-04-04 13:38:40.474068
29212025200715	سما ربيع محمد غنيمي السيد	123456	1	\N	2026-04-04 08:22:21.003816	2026-04-04 13:38:40.627281
29212025100966	السيد محمد السيد احمد محمد علي	123456	1	2	2026-04-04 08:22:32.306524	2026-04-04 15:08:10.3596
29212025100480	بوﻻ عزيز غالي رزق بطرس	123456	1	2	2026-04-04 08:22:35.767829	2026-04-04 15:08:10.3596
29212025100487	حسام علي مهدي حسن	123456	1	2	2026-04-04 08:22:37.707501	2026-04-04 15:08:10.3596
29212025100656	حسن سامح حسن احمد شهاب	123456	1	2	2026-04-04 08:22:38.139944	2026-04-04 15:08:10.3596
29212025100503	سليمان ياسر سليمان عطيه	123456	1	3	2026-04-04 08:22:42.886521	2026-04-04 15:08:10.440622
29212025200504	سما سعيد عطيه عبدالرحمن السيد	123456	1	3	2026-04-04 08:22:43.318189	2026-04-04 15:08:10.440622
29212025200505	سما محمد فتحي دسوقي محمود	123456	1	3	2026-04-04 08:22:43.535394	2026-04-04 15:08:10.440622
29212025200506	سما محمد نبيل عبدالحميد	123456	1	3	2026-04-04 08:22:43.751295	2026-04-04 15:08:10.440622
29212025200507	سهيله محمد عمر حمد عبدالغفار	123456	1	3	2026-04-04 08:22:43.966689	2026-04-04 15:08:10.440622
29212025100508	سيف محمد حسن السيد ﻻشين	123456	1	3	2026-04-04 08:22:44.18179	2026-04-04 15:08:10.440622
29212025100509	سيف محمود محمد رشاد عبدﷲ	123456	1	3	2026-04-04 08:22:44.397091	2026-04-04 15:08:10.440622
29212025100707	سيف وليد عوض محمد سعيد	123456	1	3	2026-04-04 08:22:44.612083	2026-04-04 15:08:10.440622
29212025200510	شروق يوسف محمد يوسف محمد	123456	1	3	2026-04-04 08:22:44.830281	2026-04-04 15:08:10.440622
29212025100661	شريف طارق فتحي حسين عامر	123456	1	3	2026-04-04 08:22:45.045143	2026-04-04 15:08:10.440622
29212025200511	شمس احمد جمال الدين محمود احمد	123456	1	3	2026-04-04 08:22:45.260244	2026-04-04 15:08:10.440622
29212025100662	شهاب محمد عباس احمد سليمان	123456	1	3	2026-04-04 08:22:45.475451	2026-04-04 15:08:10.440622
29212025200663	شهد احمد محمود محمد عليوه	123456	1	3	2026-04-04 08:22:45.906248	2026-04-04 15:08:10.440622
29212025100544	عمر سليمان محمد سليمان ابراهيم	123456	1	4	2026-04-04 08:22:54.991364	2026-04-04 15:08:10.521591
29212025100545	عمر صﻼح محمد محمد محمد العايدي	123456	1	4	2026-04-04 08:22:55.206247	2026-04-04 15:08:10.521591
29212025100710	عمار حسن عثمان احمد	123456	1	4	2026-04-04 08:22:53.912247	2026-04-04 15:08:10.521591
29212025100711	عمار ياسر عبدﷲ امين	123456	1	4	2026-04-04 08:22:54.127732	2026-04-04 15:08:10.521591
29212025100542	عمر السيد فتحي عبدﷲ	123456	1	4	2026-04-04 08:22:54.560832	2026-04-04 15:08:10.521591
29212025100543	عمر سعيد عطيه حسانين ابراهيم	123456	1	4	2026-04-04 08:22:54.776188	2026-04-04 15:08:10.521591
29212025100641	عمر عصام محمد عبدالمنعم منسي	123456	1	4	2026-04-04 08:22:55.422281	2026-04-04 15:08:10.521591
29212025100546	عمر محمد ابوالعباس مصطفي كمال	123456	1	4	2026-04-04 08:22:55.638051	2026-04-04 15:08:10.521591
29212025100547	عمر محمد حسين ابراهيم هاشم عجاج	123456	1	4	2026-04-04 08:22:55.853474	2026-04-04 15:08:10.521591
29212025100667	عمر مختار عبدالمجيد محمد عزام	123456	1	4	2026-04-04 08:22:56.283897	2026-04-04 15:08:10.521591
29212025100549	عمرو خالد سالم عيد حميد	123456	1	4	2026-04-04 08:22:56.499588	2026-04-04 15:08:10.521591
29212025100550	عمرو عبدالعاطي محمد عبدالعاطي عبدالهادي	123456	1	4	2026-04-04 08:22:56.716293	2026-04-04 15:08:10.521591
29212025200551	غاده ايهاب عبدالخالق احمد علي	123456	1	4	2026-04-04 08:22:56.934082	2026-04-04 15:08:10.521591
29212025100668	غريب جميل غريب محمد يوسف	123456	1	4	2026-04-04 08:22:57.150845	2026-04-04 15:08:10.521591
29212025100573	محمد طه عدوي طه عدوي	123456	1	5	2026-04-04 08:23:04.944753	2026-04-04 15:08:10.601506
29212025100574	محمد عاطف محمود تهامي عبدالمقصود	123456	1	5	2026-04-04 08:23:05.162329	2026-04-04 15:08:10.601506
29212025100675	محمد عبدالسميع سالم عبدالسميع رسﻼن	123456	1	5	2026-04-04 08:23:05.3811	2026-04-04 15:08:10.601506
29212025100575	محمد عبدﷲ خليل الحسيني عبدالخالق	123456	1	5	2026-04-04 08:23:05.597684	2026-04-04 15:08:10.601506
29212025100576	محمد عبدﷲ محمد علي محمد	123456	1	5	2026-04-04 08:23:05.813823	2026-04-04 15:08:10.601506
29212025100676	محمد عبده حسيني مصطفي عطوه	123456	1	5	2026-04-04 08:23:06.030332	2026-04-04 15:08:10.601506
29212025100577	محمد عماد عبدالعزيز حنفي	123456	1	5	2026-04-04 08:23:06.245748	2026-04-04 15:08:10.601506
29212025100578	محمد عماد فكري محمود عطيه	123456	1	5	2026-04-04 08:23:06.460914	2026-04-04 15:08:10.601506
29212025100857	ابراهيم علي ابراهيم علي عوض ﷲ	123456	1	\N	2026-04-04 08:23:25.461214	2026-04-04 13:39:26.261636
29212025100936	احمد السيد عبدالحميد السيد علوان	123456	1	\N	2026-04-04 08:23:25.675973	2026-04-04 13:39:26.414517
29212025100959	احمد ايمن محمود علي احمد	123456	1	\N	2026-04-04 08:23:25.901024	2026-04-04 13:39:26.567328
29212025100842	احمد حامد عبدﷲ عطيه خضرجي	123456	1	\N	2026-04-04 08:23:26.115949	2026-04-04 13:39:26.720416
29212025100843	احمد محمد فتحي السيد مهدي	123456	1	\N	2026-04-04 08:23:26.331951	2026-04-04 13:39:26.873119
29212025100844	احمد محمود البسيوني محمود متولي عطا ﷲ	123456	1	\N	2026-04-04 08:23:26.546686	2026-04-04 13:39:27.02629
29212025100960	احمد هاني سمير عبدالعظيم ﻻشين	123456	1	\N	2026-04-04 08:23:26.761721	2026-04-04 13:39:27.179502
29212025200845	اسماء عبدﷲ حسين عبدالحميد عبدالمولي	123456	1	\N	2026-04-04 08:23:26.97677	2026-04-04 13:39:27.332705
29212025200934	اشرقت اسامه راتب فرج السيد	123456	1	\N	2026-04-04 08:23:27.191846	2026-04-04 13:39:27.485588
29212025200846	اﻻء اسامه السيد عبدالباقي حسين	123456	1	\N	2026-04-04 08:23:27.406966	2026-04-04 13:39:27.638581
29212025200847	اﻻء حماده احمد علي عبدالفتاح	123456	1	\N	2026-04-04 08:23:27.627175	2026-04-04 13:39:27.791757
29212025200848	اﻻء سعد كمال ربيع سﻼمه	123456	1	\N	2026-04-04 08:23:27.845244	2026-04-04 13:39:27.94483
29212025200935	اﻻء ماهر ابراعيم بليغ يوسف	123456	1	\N	2026-04-04 08:23:28.276953	2026-04-04 13:39:28.2511
29212025200850	اﻻء منصور عبدالحليم علوان محمد	123456	1	\N	2026-04-04 08:23:28.493649	2026-04-04 13:39:28.40426
29212025200851	اﻻء ياسر عبدﷲ هﻼل سليمان	123456	1	\N	2026-04-04 08:23:28.711061	2026-04-04 13:39:28.557345
29212025100562	محمد احمد محمد محمد غريب	123456	1	4	2026-04-04 08:23:01.049627	2026-04-04 15:08:10.521591
29212025100581	محمد فتحي حسن سليمان مصطفي	123456	1	5	2026-04-04 08:23:07.541006	2026-04-04 15:08:10.601506
29212025100681	ممدوح ايمن ممدوح محمد خاطر	123456	1	6	2026-04-04 08:23:14.666386	2026-04-04 15:08:10.680651
29212025200609	منار صﻼح منصور محمد	123456	1	6	2026-04-04 08:23:14.88153	2026-04-04 15:08:10.680651
29212025100610	منذر محمود خطاب عفيفي خطاب	123456	1	6	2026-04-04 08:23:15.096664	2026-04-04 15:08:10.680651
29212025200611	منه ﷲ هاني السيد سالم سليمان	123456	1	6	2026-04-04 08:23:15.311039	2026-04-04 15:08:10.680651
29212025200612	منه ﷲ هشام رمضان هاشم	123456	1	6	2026-04-04 08:23:15.525924	2026-04-04 15:08:10.680651
29212025100638	مهند احمد سعد محمد السيد	123456	1	6	2026-04-04 08:23:15.741776	2026-04-04 15:08:10.680651
29212025100613	موسي محمود عطيه احمد علي	123456	1	6	2026-04-04 08:23:15.957196	2026-04-04 15:08:10.680651
29212025200975	ندى احمد محمود محمد احمد	123456	1	6	2026-04-04 08:23:16.172187	2026-04-04 15:08:10.680651
29212025200682	ندي السيد عبدالمجيد محمد عبدالعال	123456	1	6	2026-04-04 08:23:16.390278	2026-04-04 15:08:10.680651
29212025200683	ندي رامي فوزي احمد غنيم	123456	1	6	2026-04-04 08:23:16.605614	2026-04-04 15:08:10.680651
29212025200684	ندي محمد جمال عبدﷲ اسماعيل	123456	1	6	2026-04-04 08:23:16.82016	2026-04-04 15:08:10.680651
29212025200685	نوران عاصم ابراهيم امين امين	123456	1	6	2026-04-04 08:23:17.250274	2026-04-04 15:08:10.680651
29212025200617	هاجر اسامه ابراهيم الدسوقي حبيب حماد	123456	1	6	2026-04-04 08:23:17.467823	2026-04-04 15:08:10.680651
29212025200618	هاجر ايمن السيد محمد محمد	123456	1	6	2026-04-04 08:23:17.682826	2026-04-04 15:08:10.680651
29212025100619	وليد عبدالرحيم محمد محمد محمد عرب	123456	1	6	2026-04-04 08:23:17.898138	2026-04-04 15:08:10.680651
29212025200686	ياسمين محمد السيد ابراهيم واكد	123456	1	6	2026-04-04 08:23:18.113418	2026-04-04 15:08:10.680651
29212025100620	ياسين حماده عبوده زاهر محمد	123456	1	6	2026-04-04 08:23:18.329906	2026-04-04 15:08:10.680651
29212025100621	ياسين عبدالباسط ابوبكر محمد ابوالعنين	123456	1	6	2026-04-04 08:23:18.545899	2026-04-04 15:08:10.680651
29212025100622	يحيي احمد السيد عوض محمد	123456	1	6	2026-04-04 08:23:18.760815	2026-04-04 15:08:10.680651
29212025100623	يزيد خالد محمود احمد عطوان	123456	1	6	2026-04-04 08:23:18.980973	2026-04-04 15:08:10.680651
29212025100852	السيد علي السيد احمد غريب علي	123456	1	\N	2026-04-04 08:23:28.926382	2026-04-04 13:39:28.710838
29212025100937	السيد فوزي السيد الصاوي	123456	1	\N	2026-04-04 08:23:29.142679	2026-04-04 13:39:28.863939
29212025200938	اماني ايمن عبدالباسط عبدالرحمن عبدالعزيز	123456	1	\N	2026-04-04 08:23:29.358607	2026-04-04 13:39:29.017264
29212025100854	انس علي علي سليمان علي	123456	1	\N	2026-04-04 08:23:29.789871	2026-04-04 13:39:29.323818
29212025200855	ايريني مﻼك فوزي ذكي دميان	123456	1	\N	2026-04-04 08:23:30.009041	2026-04-04 13:39:29.477005
29212025100866	حسام احمد سليم احمد شاهين	123456	1	\N	2026-04-04 08:23:32.656523	2026-04-04 13:39:31.314169
29212025200867	حسناء صفوت فؤاد محمد عبده	123456	1	\N	2026-04-04 08:23:32.872058	2026-04-04 13:39:31.467114
29212025200954	حسناء محمد حلمي اسماعيل محمد	123456	1	\N	2026-04-04 08:23:33.086845	2026-04-04 13:39:31.620433
29212025200957	حنين محمد ابراهيم عبدالرحمن السيد	123456	1	\N	2026-04-04 08:23:33.301742	2026-04-04 13:39:31.773761
29212025200868	خديجه محمد ابوالمكارم فرج السيد	123456	1	\N	2026-04-04 08:23:33.539501	2026-04-04 13:39:31.926705
29212025200940	رؤي هشام محمد فتحي مبروك حسن	123456	1	\N	2026-04-04 08:23:33.7545	2026-04-04 13:39:32.080054
29212025200869	رانيا جمال عبدالرحمن محمد غريب	123456	1	\N	2026-04-04 08:23:33.974422	2026-04-04 13:39:32.233245
29212025200870	روان ابراهيم صبري علي عزازي	123456	1	\N	2026-04-04 08:23:34.190121	2026-04-04 13:39:32.386172
29212025200871	روان رمضان حمزه علي احمد	123456	1	\N	2026-04-04 08:23:34.405718	2026-04-04 13:39:32.539109
29212025200932	روان سمير محمد علي محمد	123456	1	\N	2026-04-04 08:23:34.622205	2026-04-04 13:39:32.692213
29212025200878	ساره احمد حسن السيد صقر	123456	1	\N	2026-04-04 08:23:36.346097	2026-04-04 13:39:33.917281
29212025200941	سعاد عجيب مسلم مصطفي المﻼ	123456	1	\N	2026-04-04 08:23:36.561823	2026-04-04 13:39:34.07106
29212025200879	سلمي اشرف محمد ماهر احمد	123456	1	\N	2026-04-04 08:23:36.777439	2026-04-04 13:39:34.224246
29212025200880	سلمي سليمان اسماعيل متولي مطاوع	123456	1	\N	2026-04-04 08:23:36.993202	2026-04-04 13:39:34.377232
29212025200884	سلمي محسن عبده محمد عبده	123456	1	\N	2026-04-04 08:23:37.208258	2026-04-04 13:39:34.530825
29212025200881	سلمي محمد حسني عبدالحميد سﻼم	123456	1	\N	2026-04-04 08:23:37.424296	2026-04-04 13:39:34.684172
29212025200882	سلمي محمد عبدالباعث عبدالمجيد	123456	1	\N	2026-04-04 08:23:37.639514	2026-04-04 13:39:34.837092
29212025200883	سلمي محمد عزت عبدالحليم مرسي	123456	1	\N	2026-04-04 08:23:37.855202	2026-04-04 13:39:34.990033
29212025200942	سما ايمن احمد عبده البشاوي	123456	1	\N	2026-04-04 08:23:38.070912	2026-04-04 13:39:35.14321
29212025200885	سما حمدي السيد محمد عبدالكريم	123456	1	\N	2026-04-04 08:23:38.286622	2026-04-04 13:39:35.296369
29212025200939	ايمان حمدي محمد توفيق شحاته	123456	1	\N	2026-04-04 08:23:30.224942	2026-04-04 13:39:29.630172
29212025200856	ايمان نبيل نصر عبدالحميد علي	123456	1	\N	2026-04-04 08:23:30.489742	2026-04-04 13:39:29.783295
29212025200858	بتول ايهاب رجب محمود مردن	123456	1	\N	2026-04-04 08:23:30.705204	2026-04-04 13:39:29.93626
29212025200859	بسمه محمود علي احمد الشربيني	123456	1	\N	2026-04-04 08:23:30.920348	2026-04-04 13:39:30.089228
29212025200933	تقي اشرف صبحي محمد الخياط	123456	1	\N	2026-04-04 08:23:31.136407	2026-04-04 13:39:30.242509
29212025100860	جمال الشوادفي محمد الشوادفي	123456	1	\N	2026-04-04 08:23:31.352128	2026-04-04 13:39:30.395618
29212025200861	جنا اشرف محمد طاهر عبدالراضي حجازي	123456	1	\N	2026-04-04 08:23:31.566903	2026-04-04 13:39:30.54854
29212025200862	جني اسر عزالدين ابراهيم حسين	123456	1	\N	2026-04-04 08:23:31.795301	2026-04-04 13:39:30.7017
29212025200863	جود طارق حمدي احمد بدوي	123456	1	\N	2026-04-04 08:23:32.01031	2026-04-04 13:39:30.855222
29212025100864	حازم عبدالمنعم عبدالحميد حسنين الوليلي	123456	1	\N	2026-04-04 08:23:32.22575	2026-04-04 13:39:31.008163
29212025200865	حبيبه احمد محمد علي حسن	123456	1	\N	2026-04-04 08:23:32.441047	2026-04-04 13:39:31.161055
29212025200872	روان عبدﷲ محمد عبده السيد شريف	123456	1	\N	2026-04-04 08:23:34.837565	2026-04-04 13:39:32.845491
29212025200873	رويدا محمود فوزي احمد محمد	123456	1	\N	2026-04-04 08:23:35.052751	2026-04-04 13:39:32.998447
29212025200874	ريتاج حازم فاروق عبده السيد	123456	1	\N	2026-04-04 08:23:35.267896	2026-04-04 13:39:33.151669
29212025100875	زياد عماد محمد ابراهيم خليل	123456	1	\N	2026-04-04 08:23:35.483316	2026-04-04 13:39:33.304806
29212025100955	زياد محمد فؤاد محمد علوان	123456	1	\N	2026-04-04 08:23:35.699825	2026-04-04 13:39:33.457648
29212025200886	سهيله ياسر فتحي محمد مرسي صقر	123456	1	\N	2026-04-04 08:23:38.501914	2026-04-04 13:39:35.449211
29212025200887	سوميه علي جمال علي علي	123456	1	\N	2026-04-04 08:23:38.717394	2026-04-04 13:39:35.602181
29212025100888	سيف الدين مجدي عبداللطيف عبدالغني رشيد	123456	1	\N	2026-04-04 08:23:38.932716	2026-04-04 13:39:35.755007
29212025200943	شهد سعيد شوقي علي عامر	123456	1	\N	2026-04-04 08:23:39.14772	2026-04-04 13:39:35.907883
29212025200890	شهد عﻼء محمد فرحات عامر	123456	1	\N	2026-04-04 08:23:39.578193	2026-04-04 13:39:36.214327
29212025200930	صفاء عبدالحميد عبدالرؤف عبدالحميد علي	123456	1	\N	2026-04-04 08:23:39.794009	2026-04-04 13:39:36.367523
29212025100958	ضياء محمد يوسف محمد سيد احمد	123456	1	\N	2026-04-04 08:23:40.010302	2026-04-04 13:39:36.520772
29212025100891	عبدالرحمن شريف فكري عبدالعزيز عبدالعظيم	123456	1	\N	2026-04-04 08:23:40.227899	2026-04-04 13:39:36.674239
29212025100892	عبدالرحمن عبدﷲ صابر محمد عبدالمولي	123456	1	\N	2026-04-04 08:23:40.443473	2026-04-04 13:39:36.8271
29212025200893	عفاف حماده راضي عبدالسﻼم رمضان	123456	1	\N	2026-04-04 08:23:40.659021	2026-04-04 13:39:36.980078
29212025100894	عمار ياسر احمد وفا يوسف	123456	1	\N	2026-04-04 08:23:40.876537	2026-04-04 13:39:37.133396
29212025200895	فرح اشرف السيد رضوان منصور	123456	1	\N	2026-04-04 08:23:41.092087	2026-04-04 13:39:37.286935
29212025200897	لمي احمد محمد علي موسي	123456	1	\N	2026-04-04 08:23:41.525733	2026-04-04 13:39:37.592585
29212025200898	لوجين فوزي السيد اسماعيل ضﻼم	123456	1	\N	2026-04-04 08:23:41.740907	2026-04-04 13:39:37.745432
29212025100917	مؤمن محمد صابر غريب علي	123456	1	\N	2026-04-04 08:23:41.955961	2026-04-04 13:39:37.898194
29212025100899	مازن السيد ابراهيم السيد محمد	123456	1	\N	2026-04-04 08:23:42.171535	2026-04-04 13:39:38.051142
29212025100900	محمد احمد سليمان ابراهيم سليمان	123456	1	\N	2026-04-04 08:23:42.386884	2026-04-04 13:39:38.204024
29212025100944	محمد احمد عبدالوهاب محمود رجب	123456	1	\N	2026-04-04 08:23:42.602654	2026-04-04 13:39:38.357
29212025100901	محمد احمد علي محمد حماد	123456	1	\N	2026-04-04 08:23:42.817759	2026-04-04 13:39:38.509725
29212025100945	محمد احمد محمد عبده حسن	123456	1	\N	2026-04-04 08:23:43.032633	2026-04-04 13:39:38.663009
29212025100902	محمد الطاهر ابراهيم اسماعيل	123456	1	\N	2026-04-04 08:23:43.248682	2026-04-04 13:39:38.816572
29212025100946	محمد ايهاب زكي عبدالحكيم محمد	123456	1	\N	2026-04-04 08:23:43.468456	2026-04-04 13:39:38.969453
29212025100903	محمد خالد محمد عبدالحميد البكاتوشي	123456	1	\N	2026-04-04 08:23:43.684198	2026-04-04 13:39:39.122779
29212025100947	محمد رفعت عبدالرحمن حسن جبريل	123456	1	\N	2026-04-04 08:23:43.899365	2026-04-04 13:39:39.275981
29212025100904	محمد شريف محمد طلعت السيد قمر	123456	1	\N	2026-04-04 08:23:44.116148	2026-04-04 13:39:39.428802
29212025100905	محمد شريف محمد مهدي مجاهد	123456	1	\N	2026-04-04 08:23:44.331423	2026-04-04 13:39:39.582064
29212025100948	محمد صفوت درويش محمد درويش	123456	1	\N	2026-04-04 08:23:44.547155	2026-04-04 13:39:39.735194
29212025100906	محمد عبدالقادر محمد عبدالسﻼم متولي	123456	1	\N	2026-04-04 08:23:44.762117	2026-04-04 13:39:39.888121
29212025100907	محمد وليد محمد محرم حسن	123456	1	\N	2026-04-04 08:23:44.977644	2026-04-04 13:39:40.041361
29212025100908	محمود رضا محمد محمد علي موسي	123456	1	\N	2026-04-04 08:23:45.193298	2026-04-04 13:39:40.194296
29212025100956	محمود عبدالغني محمود عبدالغني عطوه	123456	1	\N	2026-04-04 08:23:45.408599	2026-04-04 13:39:40.347035
29212025100909	محمود عﻼء الدين طه السيد عبدالسﻼم	123456	1	\N	2026-04-04 08:23:45.62369	2026-04-04 13:39:40.50039
29212025100910	محمود مجدي عبدالستار السيد حجاج	123456	1	\N	2026-04-04 08:23:45.838561	2026-04-04 13:39:40.653809
29212025200911	مدينه سامح فاروق علي عبدربه	123456	1	\N	2026-04-04 08:23:46.05365	2026-04-04 13:39:40.806737
29212025200949	مريم محمد عطيه عليوه عطيه	123456	1	\N	2026-04-04 08:23:46.48694	2026-04-04 13:39:41.11292
29212025100950	مصطفي صﻼح مصطفي يسن حلوه	123456	1	\N	2026-04-04 08:23:46.702481	2026-04-04 13:39:41.278774
29212025100913	مصطفي عﻼء عبدﷲ عطيه ابوالعزم موسي	123456	1	\N	2026-04-04 08:23:46.918273	2026-04-04 13:39:41.432007
29212025100914	معاذ محمود وهبه عبدالباقي ابراهيم	123456	1	\N	2026-04-04 08:23:47.133463	2026-04-04 13:39:41.584882
29212025200931	منه احمد السيد محمد محمد فريد	123456	1	\N	2026-04-04 08:23:47.348881	2026-04-04 13:39:41.737882
29212025200915	منه ﷲ طارق محمد عبدالفتاح محمد	123456	1	\N	2026-04-04 08:23:47.56563	2026-04-04 13:39:41.89146
29212025200916	منه عماد حمدي عطيه حسن	123456	1	\N	2026-04-04 08:23:47.78472	2026-04-04 13:39:42.044944
29212025200918	نادين الهيثم احمد عبده علي فرج	123456	1	\N	2026-04-04 08:23:48.002239	2026-04-04 13:39:42.19786
29212025200951	نور الهدي محمد زكريا احمد مصطفي	123456	1	\N	2026-04-04 08:23:48.217002	2026-04-04 13:39:42.351352
29212025200919	نور خالد السيد عباس غنيمي	123456	1	\N	2026-04-04 08:23:48.432267	2026-04-04 13:39:42.504145
29212025200920	هاجر محمد فوزي محمد حسانين	123456	1	\N	2026-04-04 08:23:48.647696	2026-04-04 13:39:42.657008
29212025100732	زياد سعد صبحي سعد عقرب	123456	1	\N	2026-04-04 08:22:02.83671	2026-04-04 13:38:27.731212
29212025100821	عمر محمد عبدالوهاب عبدالرحمن عمر	123456	1	\N	2026-04-04 08:22:09.964567	2026-04-04 13:38:32.810945
29212025100753	محمد حامد حماد فرحان غانم	123456	1	\N	2026-04-04 08:22:12.352407	2026-04-04 13:38:34.496676
29212025100788	يوسف ايمن السيد عدلي السيد خليل	123456	1	\N	2026-04-04 08:22:20.142555	2026-04-04 13:38:40.014083
29212025200849	اﻻء عﻼء السيد احمد علي سالم	123456	1	\N	2026-04-04 08:23:28.061726	2026-04-04 13:39:28.09771
29212025100853	امجد خالد السيد محمد سعد	123456	1	\N	2026-04-04 08:23:29.573969	2026-04-04 13:39:29.170419
29212025100876	زياد وائل محمد مهدي عبدالحي	123456	1	\N	2026-04-04 08:23:35.91559	2026-04-04 13:39:33.610908
29212025200889	شهد عبدﷲ محمد عبدالفتاح شعبان	123456	1	\N	2026-04-04 08:23:39.362387	2026-04-04 13:39:36.061394
29212025200912	مرام عبدالستار عبدالرحمن حسن دسوقي	123456	1	\N	2026-04-04 08:23:46.271752	2026-04-04 13:39:40.959801
29212025200921	هاجر هاني ابوالعباس علي مرسي	123456	1	\N	2026-04-04 08:23:48.865468	2026-04-04 13:39:42.809773
29212025200922	هنا احمد خليل حسن عيسي	123456	1	\N	2026-04-04 08:23:49.08168	2026-04-04 13:39:42.963088
29212025200923	هنا عمرو حسن علي حسانين	123456	1	\N	2026-04-04 08:23:49.297082	2026-04-04 13:39:43.117448
29212025200952	وفاء محمد احمد مصطفي الخولي	123456	1	\N	2026-04-04 08:23:49.512613	2026-04-04 13:39:43.270713
29212025100924	وليد عادل احمد محمد شعبان	123456	1	\N	2026-04-04 08:23:49.728301	2026-04-04 13:39:43.423984
29212025100953	يوسف السيد محب عبداللطيف عايديه	123456	1	\N	2026-04-04 08:23:49.944392	2026-04-04 13:39:43.576791
29212025100925	يوسف ايمن عنتر صابر بسيوني محمد	123456	1	\N	2026-04-04 08:23:50.159311	2026-04-04 13:39:43.72991
29212025100926	يوسف صبري عبدالمعبود سليمان	123456	1	\N	2026-04-04 08:23:50.374194	2026-04-04 13:39:43.883182
29212025100927	يوسف عبدالمعبود عبدالمعبود احمد اسﻼم	123456	1	\N	2026-04-04 08:23:50.588825	2026-04-04 13:39:44.035974
29212025100928	يوسف عﻼء عبدالمنعم قاسم سلمان	123456	1	\N	2026-04-04 08:23:50.80451	2026-04-04 13:39:44.188885
29212025100929	يوسف وليد عثمان سيد	123456	1	\N	2026-04-04 08:23:51.020005	2026-04-04 13:39:44.350748
29212025100802	احمد محمود عبدالمقصود عبدالباري عبدالحميد	123456	1	\N	2026-04-04 08:21:56.517413	2026-04-04 13:38:23.289585
29212025200735	زينب حامد عبدالرحيم ابوزيد	123456	1	\N	2026-04-04 08:22:03.48618	2026-04-04 13:38:28.191212
29212025100738	سيف محمد محمود فهمي زهيري ابراهيم	123456	1	\N	2026-04-04 08:22:04.566219	2026-04-04 13:38:28.957797
29212025100819	عمر عماد السيد حسن ابراهيم رمضان	123456	1	\N	2026-04-04 08:22:09.5319	2026-04-04 13:38:32.504514
29212025100770	مصطفي محمود عبده محمود شاكر	123456	1	\N	2026-04-04 08:22:16.699724	2026-04-04 13:38:37.562554
29212025100471	السيد احمد السيد محمد محمد	123456	1	1	2026-04-04 08:22:31.641287	2026-04-04 15:08:10.270509
29212025100655	حسن راضي عبدالعاطي شاكر محمود الشيمي	123456	1	2	2026-04-04 08:22:37.923376	2026-04-04 15:08:10.3596
29212025100497	زياد السيد علي محمد محمد	123456	1	2	2026-04-04 08:22:41.377861	2026-04-04 15:08:10.3596
29212025200702	بسمله وحيد محمد ابراهيم	123456	1	2	2026-04-04 08:22:34.903696	2026-04-04 15:08:10.3596
29212025200512	شهد ابراهيم محمد بكري ابراهيم والي	123456	1	3	2026-04-04 08:22:45.690573	2026-04-04 15:08:10.440622
29212025100666	عبدﷲ اشرف ماجد محمد عزيز	123456	1	3	2026-04-04 08:22:50.868639	2026-04-04 15:08:10.440622
29212025100540	عمار اسامه عبدالبديع عبدالرحمن اسماعيل	123456	1	4	2026-04-04 08:22:53.696674	2026-04-04 15:08:10.521591
29212025100560	محمد احمد محمد الطاهر اسماعيل مصطفي	123456	1	4	2026-04-04 08:23:00.618715	2026-04-04 15:08:10.521591
29212025100583	محمد فتحي مهران عبداللطيف عصر	123456	1	5	2026-04-04 08:23:07.97195	2026-04-04 15:08:10.601506
29212025100594	محمد وائل محمد ابراهيم ابراهيم	123456	1	5	2026-04-04 08:23:10.355797	2026-04-04 15:08:10.601506
29212025100877	زياد وليد متولي عبدالحميدمتولي	123456	1	\N	2026-04-04 08:23:36.131023	2026-04-04 13:39:33.7637
29212025100896	كريم محمد عبدالعزيز عبدالحليم عبدالعزيز	123456	1	\N	2026-04-04 08:23:41.309933	2026-04-04 13:39:37.439831
29212025100438	ابراهيم محمد عبدﷲ ابراهيم	123456	1	1	2026-04-04 08:22:21.865553	2026-04-04 15:08:10.270509
29212025100705	تامر علي السيد علي احمد	123456	1	2	2026-04-04 08:22:36.414837	2026-04-04 15:08:10.3596
29212025100495	ريان صﻼح منصور هجرسي علي العباسي	123456	1	2	2026-04-04 08:22:40.947121	2026-04-04 15:08:10.3596
29212025200700	سما السيد محمد ابوخليل محمد	123456	1	3	2026-04-04 08:22:43.102194	2026-04-04 15:08:10.440622
29212025200514	شهد محسن عبدالغني محمود ابراهيم	123456	1	3	2026-04-04 08:22:46.553696	2026-04-04 15:08:10.440622
29212025100978	عبدالرحمن فوزي محمد سعيد مصطفي ابراهيم الجندي	123456	1	3	2026-04-04 08:22:48.922819	2026-04-04 15:08:10.440622
29212025100541	عمر ابراهيم محمد محمد الشيخ	123456	1	4	2026-04-04 08:22:54.343054	2026-04-04 15:08:10.521591
29212025100548	عمر محمود حسني علي زهران	123456	1	4	2026-04-04 08:22:56.068561	2026-04-04 15:08:10.521591
29212025100553	فارس نبيل عبدالخالق السيد محمود رستم	123456	1	4	2026-04-04 08:22:57.584037	2026-04-04 15:08:10.521591
29212025100561	محمد احمد محمد عبدالحميد محمد البسيوني	123456	1	4	2026-04-04 08:23:00.834453	2026-04-04 15:08:10.521591
29212025100579	محمد عمرو احمد محمود محمد	123456	1	5	2026-04-04 08:23:06.677104	2026-04-04 15:08:10.601506
29212025100976	مصطفى سعيد محمد سعيد غمرى	123456	1	5	2026-04-04 08:23:13.374194	2026-04-04 15:08:10.601506
29212025100616	نصرالدين محمود نصر احمد نصر مرعي	123456	1	6	2026-04-04 08:23:17.035203	2026-04-04 15:08:10.680651
29212025100627	يوسف احمد ناصر ابراهيم عطيه ابو خضره	123456	1	6	2026-04-04 08:23:20.059868	2026-04-04 15:08:10.680651
29212025100688	يوسف اسﻼم عبدﷲ محمد ابو عيش	123456	1	6	2026-04-04 08:23:20.276397	2026-04-04 15:08:10.680651
29212025100631	يوسف سراج الدين عبدالعظيم السيد حسبو	123456	1	6	2026-04-04 08:23:21.576346	2026-04-04 15:08:10.680651
29212025100639	يوسف وائل عبدالرحمن محمد غريب	123456	1	6	2026-04-04 08:23:25.029768	2026-04-04 15:08:10.680651
29212025100472	انس عصام السيد رجب السيد	123456	1	2	2026-04-04 08:22:32.522072	2026-04-04 15:08:10.3596
29212025200473	ايات شريف السيد محمود ابراهيم	123456	1	2	2026-04-04 08:22:32.738338	2026-04-04 15:08:10.3596
29212025100521	عبدالرحمن رمزي السيد محمد سليمان	123456	1	3	2026-04-04 08:22:48.492172	2026-04-04 15:08:10.440622
29212025100522	عبدالرحمن عمرو احمد علي طلبه	123456	1	3	2026-04-04 08:22:48.707465	2026-04-04 15:08:10.440622
29212025100523	عبدالرحمن محمد سامح محمد محب عبده محمد منصور	123456	1	3	2026-04-04 08:22:49.139591	2026-04-04 15:08:10.440622
29212025100665	عبدالرحمن محمد يحيي محمد يوسف	123456	1	3	2026-04-04 08:22:49.35577	2026-04-04 15:08:10.440622
29212025100524	عبدالرحمن منير حسني منير الدسوقي	123456	1	3	2026-04-04 08:22:49.571982	2026-04-04 15:08:10.440622
29212025100525	عبدالسﻼم محمد عبدالسﻼم طلبه رباح	123456	1	3	2026-04-04 08:22:49.788694	2026-04-04 15:08:10.440622
29212025100518	عبدالعزيز احمد عبدالعزيز الهادي احمد	123456	1	3	2026-04-04 08:22:50.005956	2026-04-04 15:08:10.440622
29212025100526	عبدالعزيز هيثم عبدالعزيز عبدالكريم جمعه مخيمر	123456	1	3	2026-04-04 08:22:50.223162	2026-04-04 15:08:10.440622
29212025100527	عبدالعزيز ياسر السيد احمد عطيه	123456	1	3	2026-04-04 08:22:50.439532	2026-04-04 15:08:10.440622
29212025100528	عبدالعظيم عصام عبدالعظيم محمد حسن	123456	1	3	2026-04-04 08:22:50.653946	2026-04-04 15:08:10.440622
29212025100530	عبدﷲ محمد جﻼل محمد عبدالعزيز	123456	1	3	2026-04-04 08:22:51.299562	2026-04-04 15:08:10.440622
29212025100531	عبدﷲ محمد عبدالجواد محمد	123456	1	3	2026-04-04 08:22:51.51597	2026-04-04 15:08:10.440622
29212025100532	عبدﷲ محمد عبدﷲ عبداللطيف اسماعيل	123456	1	3	2026-04-04 08:22:51.755271	2026-04-04 15:08:10.440622
29212025100533	عبدالمنعم خالد عبدالرحمن علي عبدالرحمن	123456	1	3	2026-04-04 08:22:51.970694	2026-04-04 15:08:10.440622
29212025100709	عبدالوهاب عادل عبدالوهاب بيومي	123456	1	3	2026-04-04 08:22:52.18616	2026-04-04 15:08:10.440622
29212025100534	عبيده عمر محمد محمد مصطفي	123456	1	3	2026-04-04 08:22:52.403273	2026-04-04 15:08:10.440622
29212025100535	عزام السيد البيومي جاد	123456	1	3	2026-04-04 08:22:52.618874	2026-04-04 15:08:10.440622
29212025100536	عصام اشرف السيد رضا غريب	123456	1	3	2026-04-04 08:22:52.834054	2026-04-04 15:08:10.440622
29212025100537	علي عبدالمجيد امين علي	123456	1	3	2026-04-04 08:22:53.049558	2026-04-04 15:08:10.440622
29212025100538	علي محمود علي علي هنداوي	123456	1	3	2026-04-04 08:22:53.265337	2026-04-04 15:08:10.440622
29212025100552	فادي اسامه علي محمد احمد البعبوشي	123456	1	4	2026-04-04 08:22:57.367402	2026-04-04 15:08:10.521591
29212025100554	فتحي ممدوح بكري احمد بكري	123456	1	4	2026-04-04 08:22:57.801359	2026-04-04 15:08:10.521591
29212025100555	كريم احمد محمد احمد محمد الجوهري	123456	1	4	2026-04-04 08:22:58.018006	2026-04-04 15:08:10.521591
29212025100961	كريم حالد محمود محمد عرفه	123456	1	4	2026-04-04 08:22:58.233858	2026-04-04 15:08:10.521591
29212025100712	كريم عبدالمنعم عبدالفتاح محمد علي	123456	1	4	2026-04-04 08:22:58.449159	2026-04-04 15:08:10.521591
29212025100614	مؤمن احمد السيد علي نجم	123456	1	4	2026-04-04 08:22:58.66759	2026-04-04 15:08:10.521591
29212025100615	مؤمن السعيد يوسف مؤمن ابراهيم	123456	1	4	2026-04-04 08:22:58.891493	2026-04-04 15:08:10.521591
29212025200556	ماريان اسامه عيسي زكي ابراهيم	123456	1	4	2026-04-04 08:22:59.106449	2026-04-04 15:08:10.521591
29212025100972	مازن السيد مهدي السيد شندي	123456	1	4	2026-04-04 08:22:59.324218	2026-04-04 15:08:10.521591
29212025100557	محمد ابراهيم جميل ابراهيم محمد	123456	1	4	2026-04-04 08:22:59.539879	2026-04-04 15:08:10.521591
29212025100558	محمد احمد رمضان الشحات السيد	123456	1	4	2026-04-04 08:22:59.755819	2026-04-04 15:08:10.521591
29212025100559	محمد احمد عبدالفتاح سالم	123456	1	4	2026-04-04 08:22:59.970693	2026-04-04 15:08:10.521591
29212025100669	محمد احمد كمال احمد رمضان	123456	1	4	2026-04-04 08:23:00.188309	2026-04-04 15:08:10.521591
29212025100670	محمد احمد محمد احمد قطايا	123456	1	4	2026-04-04 08:23:00.403506	2026-04-04 15:08:10.521591
29212025100671	محمد اشرف محمد عبدالرحمن علي سالم	123456	1	4	2026-04-04 08:23:01.265551	2026-04-04 15:08:10.521591
29212025100701	محمد اشرف محمد مصطفي	123456	1	4	2026-04-04 08:23:01.480848	2026-04-04 15:08:10.521591
29212025100563	محمد اشرف يحي حسن السيد	123456	1	4	2026-04-04 08:23:01.696959	2026-04-04 15:08:10.521591
29212025100672	محمد السيد جابر السيد عطيه	123456	1	4	2026-04-04 08:23:01.912671	2026-04-04 15:08:10.521591
29212025100564	محمد السيد رافت عبدالنعيم مجاهد	123456	1	4	2026-04-04 08:23:02.128918	2026-04-04 15:08:10.521591
29212025100565	محمد السيد سعيد مصطفي	123456	1	4	2026-04-04 08:23:02.346606	2026-04-04 15:08:10.521591
29212025100566	محمد امام محمد سليمان سلمي عطيه	123456	1	4	2026-04-04 08:23:02.561919	2026-04-04 15:08:10.521591
29212025100567	محمد ايهاب محمد علي ابراهيم رضوان	123456	1	4	2026-04-04 08:23:02.777572	2026-04-04 15:08:10.521591
29212025100568	محمد بهاء محمد كمال	123456	1	4	2026-04-04 08:23:02.993471	2026-04-04 15:08:10.521591
29212025100673	محمد حسام فرج حسن فرج	123456	1	4	2026-04-04 08:23:03.210455	2026-04-04 15:08:10.521591
29212025100569	محمد زكريا محروس عبدالعزيز طلبه	123456	1	4	2026-04-04 08:23:03.427547	2026-04-04 15:08:10.521591
29212025100570	محمد سعيد محمد سعد عبدالقادر	123456	1	4	2026-04-04 08:23:03.643889	2026-04-04 15:08:10.521591
29212025100674	محمد سليمان محمد سليمان موسي	123456	1	4	2026-04-04 08:23:03.860781	2026-04-04 15:08:10.521591
29212025100962	محمد صﻼح احمد محمود احمد	123456	1	4	2026-04-04 08:23:04.07729	2026-04-04 15:08:10.521591
29212025100713	محمد صﻼح محمد احمد محمد	123456	1	4	2026-04-04 08:23:04.295031	2026-04-04 15:08:10.521591
29212025100605	مصطفي طارق مصطفي جمعه عزب	123456	1	5	2026-04-04 08:23:13.805154	2026-04-04 15:08:10.601506
29212025100606	مصطفي عبدالرحمن علي محمد احمد سالم	123456	1	5	2026-04-04 08:23:14.021021	2026-04-04 15:08:10.601506
29212025100607	مصطفي عوض ابراهيم العدوي محمد	123456	1	5	2026-04-04 08:23:14.235776	2026-04-04 15:08:10.601506
29212025100608	مصطفي محمد اسماعيل ابراهيم عبدالرحمن	123456	1	5	2026-04-04 08:23:14.450973	2026-04-04 15:08:10.601506
29212025100624	يوسف ابراهيم عادل ابراهيم	123456	1	6	2026-04-04 08:23:19.196488	2026-04-04 15:08:10.680651
29212025100625	يوسف احمد السيد عوض محمد	123456	1	6	2026-04-04 08:23:19.413038	2026-04-04 15:08:10.680651
29212025100687	يوسف احمد عبدالحليم عبدالحليم السيد مدكور	123456	1	6	2026-04-04 08:23:19.628566	2026-04-04 15:08:10.680651
29212025100626	يوسف احمد عبدالحميد اسماعيل السيد	123456	1	6	2026-04-04 08:23:19.844048	2026-04-04 15:08:10.680651
29212025100690	يوسف سامح عبدالحميد محمد ابوالعﻼ	123456	1	6	2026-04-04 08:23:21.360532	2026-04-04 15:08:10.680651
29212025100629	يوسف ايمن بهجت السيد عبدالغني	123456	1	6	2026-04-04 08:23:20.714012	2026-04-04 15:08:10.680651
29212025100630	يوسف باسم كرم ابراهيم لبيب	123456	1	6	2026-04-04 08:23:20.92962	2026-04-04 15:08:10.680651
29212025100689	يوسف حسني عبدالمقصود ابراهيم عبدالمقصود	123456	1	6	2026-04-04 08:23:21.145198	2026-04-04 15:08:10.680651
29212025100691	يوسف صﻼح سالم ابراهيم سالم	123456	1	6	2026-04-04 08:23:21.791931	2026-04-04 15:08:10.680651
29212025100692	يوسف عماد السيد عبدالمقصود مصطفي بعلل	123456	1	6	2026-04-04 08:23:22.007004	2026-04-04 15:08:10.680651
29212025100632	يوسف عمر عبدالفتاح مهدي	123456	1	6	2026-04-04 08:23:22.222411	2026-04-04 15:08:10.680651
29212025100633	يوسف عمرو محمد خيري	123456	1	6	2026-04-04 08:23:22.437563	2026-04-04 15:08:10.680651
29212025100634	يوسف مجدي الشوادفي علي السيد	123456	1	6	2026-04-04 08:23:22.653242	2026-04-04 15:08:10.680651
29212025100635	يوسف محمد احمد محمد العيساوي	123456	1	6	2026-04-04 08:23:22.867992	2026-04-04 15:08:10.680651
29212025100636	يوسف محمد السيد احمد ابراهيم	123456	1	6	2026-04-04 08:23:23.082964	2026-04-04 15:08:10.680651
29212025100693	يوسف محمد السيد عبدالعظيم ابوالعنين	123456	1	6	2026-04-04 08:23:23.303095	2026-04-04 15:08:10.680651
29212025100637	يوسف محمد عبدالرحمن السيد	123456	1	6	2026-04-04 08:23:23.518112	2026-04-04 15:08:10.680651
29212025100694	يوسف محمد عبدالماجد ابراهيم محمد	123456	1	6	2026-04-04 08:23:23.734876	2026-04-04 15:08:10.680651
29212025100695	يوسف محمد مرسي عبدﷲ الساعي	123456	1	6	2026-04-04 08:23:23.949832	2026-04-04 15:08:10.680651
29212025100696	يوسف محمود السيد محمود ابوالخير	123456	1	6	2026-04-04 08:23:24.164672	2026-04-04 15:08:10.680651
29212025100697	يوسف محمود محمد محمود الزيات	123456	1	6	2026-04-04 08:23:24.379694	2026-04-04 15:08:10.680651
2021003	Omar Youssef	123456	1	1	2026-04-04 08:02:58.916366	2026-04-04 15:08:10.270509
29212025100436	ابانوب رمزي فوزي روفائيل	123456	1	1	2026-04-04 08:22:21.218804	2026-04-04 15:08:10.270509
29212025100968	ابراهيم محمد ابراهيم محمد علي	123456	1	1	2026-04-04 08:22:21.649733	2026-04-04 15:08:10.270509
29212025100716	احمد اسامه محمود عبدالحليم سليم	123456	1	1	2026-04-04 08:22:22.517709	2026-04-04 15:08:10.270509
29212025100447	احمد حمزه علي علي سالم	123456	1	1	2026-04-04 08:22:24.243679	2026-04-04 15:08:10.270509
29212025100439	ابراهيم ياسر ابرهيم حسانين عبدالعزيز	123456	1	1	2026-04-04 08:22:22.080656	2026-04-04 15:08:10.270509
29212025100648	احمد محمود المنشاوي ابوالمجد ابراهيم	123456	1	1	2026-04-04 08:22:28.79716	2026-04-04 15:08:10.270509
29212025100437	ابراهيم محمد ابراهيم محمد اﻻنور	123456	1	1	2026-04-04 08:22:21.434438	2026-04-04 15:08:10.270509
29212025100445	احمد حسن توفيق سعد الدين جمعه	123456	1	1	2026-04-04 08:22:24.025741	2026-04-04 15:08:10.270509
29212025100441	احمد السيد محمد حسن حسين	123456	1	1	2026-04-04 08:22:22.732864	2026-04-04 15:08:10.270509
29212025100442	احمد الهادي محمد محمد شعيب	123456	1	1	2026-04-04 08:22:22.948733	2026-04-04 15:08:10.270509
29212025100443	احمد ايمن فتحي سليمان سالم	123456	1	1	2026-04-04 08:22:23.164678	2026-04-04 15:08:10.270509
29212025100717	احمد جاد محمد جاد الشرقاوي	123456	1	1	2026-04-04 08:22:23.379484	2026-04-04 15:08:10.270509
29212025100718	احمد حسام محي الدين محمد محمود	123456	1	1	2026-04-04 08:22:23.594819	2026-04-04 15:08:10.270509
29212025100448	احمد خالد الشحات محمد التهامي علي	123456	1	1	2026-04-04 08:22:24.462473	2026-04-04 15:08:10.270509
29212025100449	احمد خيري سامي طلبه عمر	123456	1	1	2026-04-04 08:22:24.678934	2026-04-04 15:08:10.270509
29212025100719	احمد راضي صابر حامد ابراهيم	123456	1	1	2026-04-04 08:22:24.894123	2026-04-04 15:08:10.270509
29212025100450	احمد سامح شعبان محمد السيد	123456	1	1	2026-04-04 08:22:25.328252	2026-04-04 15:08:10.270509
29212025100451	احمد سامح محمدي محمد ابوجﻼله	123456	1	1	2026-04-04 08:22:25.544214	2026-04-04 15:08:10.270509
29212025100452	احمد سامي جوده فرج السيد عبدالعال	123456	1	1	2026-04-04 08:22:25.759696	2026-04-04 15:08:10.270509
29212025100453	احمد سعيد عبدالعليم عبدالرشيد ابراهيم	123456	1	1	2026-04-04 08:22:25.975117	2026-04-04 15:08:10.270509
29212025100645	احمد شحته ابراهيم احمد عطيه	123456	1	1	2026-04-04 08:22:26.190476	2026-04-04 15:08:10.270509
29212025100454	احمد شريف احمد احمد عطيه	123456	1	1	2026-04-04 08:22:26.406322	2026-04-04 15:08:10.270509
29212025100455	احمد عبدالعزيز السيد عبدالرحمن العساسي	123456	1	1	2026-04-04 08:22:26.621738	2026-04-04 15:08:10.270509
29212025100456	احمد عﻼء الدين طلعت عزام	123456	1	1	2026-04-04 08:22:26.838453	2026-04-04 15:08:10.270509
29212025100457	احمد عماد محمد عبدالرشيد محمد التهامي عقيل	123456	1	1	2026-04-04 08:22:27.053281	2026-04-04 15:08:10.270509
29212025100646	احمد محمد السيد عبدالحميد بدر	123456	1	1	2026-04-04 08:22:27.268628	2026-04-04 15:08:10.270509
29212025100458	احمد محمد شحاته عبدالرحمن محمد	123456	1	1	2026-04-04 08:22:27.483895	2026-04-04 15:08:10.270509
29212025100459	احمد محمد صﻼح سيد احمد زرقه	123456	1	1	2026-04-04 08:22:27.699515	2026-04-04 15:08:10.270509
29212025100460	احمد محمد عمر عبدالحميد	123456	1	1	2026-04-04 08:22:27.915157	2026-04-04 15:08:10.270509
29212025100461	احمد محمد محمود الشحات	123456	1	1	2026-04-04 08:22:28.141035	2026-04-04 15:08:10.270509
29212025100462	احمد محمود احمد متولي عبدالكريم	123456	1	1	2026-04-04 08:22:28.581597	2026-04-04 15:08:10.270509
29212025100463	احمد مصطفي محمد مصطفي عبدالقادر	123456	1	1	2026-04-04 08:22:29.012455	2026-04-04 15:08:10.270509
29212025100704	احمد منير السيد السيد صقر	123456	1	1	2026-04-04 08:22:29.228088	2026-04-04 15:08:10.270509
29212025100727	ابراهيم علي السيد محمد عبدﷲ	123456	1	1	2026-04-04 08:21:54.562101	2026-04-04 15:08:10.270509
29212025100979	احمد زينهم حسني محمد محمد	123456	1	1	2026-04-04 08:22:25.109496	2026-04-04 15:08:10.270509
29212025100464	احمد هﻼل محمد عطيه محمد	123456	1	1	2026-04-04 08:22:29.443093	2026-04-04 15:08:10.270509
29212025100465	احمد يحي عبدﷲ عبدالعال شلبي	123456	1	1	2026-04-04 08:22:29.662836	2026-04-04 15:08:10.270509
29212025100477	اسامه محمد جمال عبدالسﻼم حسين	123456	1	1	2026-04-04 08:22:29.879545	2026-04-04 15:08:10.270509
29212025100467	اسامه محمد مسعد الحسيني مسعود سالم	123456	1	1	2026-04-04 08:22:30.095147	2026-04-04 15:08:10.270509
29212025100468	اسﻼم سعيد محمد عبدالسﻼم حسن	123456	1	1	2026-04-04 08:22:30.34762	2026-04-04 15:08:10.270509
29212025100965	اسﻼم محمد حسن احمد العبيدي	123456	1	1	2026-04-04 08:22:30.562907	2026-04-04 15:08:10.270509
29212025100970	اسﻼم محمد عبدالستار مغربي السيد	123456	1	1	2026-04-04 08:22:30.778756	2026-04-04 15:08:10.270509
29212025100469	اسماعيل احمد اسماعيل محمد الباجوري	123456	1	1	2026-04-04 08:22:30.994862	2026-04-04 15:08:10.270509
29212025100470	اكرم ايمن احمد مهدي سليمان	123456	1	1	2026-04-04 08:22:31.210124	2026-04-04 15:08:10.270509
29212025200703	اﻻء محمد احمد حامد محمد	123456	1	1	2026-04-04 08:22:31.426592	2026-04-04 15:08:10.270509
29212025100440	احمد ابراهيم السيد محمد علي سالم سليم	123456	1	1	2026-04-04 08:22:22.297411	2026-04-04 15:08:10.270509
29212025100444	احمد حسام يسري زين العابدين محمد رزق	123456	1	1	2026-04-04 08:22:23.810245	2026-04-04 15:08:10.270509
29212025100647	احمد محمد موسي عبدالرحمن الصادي	123456	1	1	2026-04-04 08:22:28.365487	2026-04-04 15:08:10.270509
29212025100649	السيد حسن السيد محمد السيد	123456	1	1	2026-04-04 08:22:31.872067	2026-04-04 15:08:10.270509
29212025100479	بﻼل طاهر سليم الشبراوي احمد	123456	1	2	2026-04-04 08:22:35.551892	2026-04-04 15:08:10.3596
29212025100481	بيتر عزمي حبيب حنا	123456	1	2	2026-04-04 08:22:35.984013	2026-04-04 15:08:10.3596
29212025100482	بيتر وائل عبدﷲ عدلي رزق	123456	1	2	2026-04-04 08:22:36.19964	2026-04-04 15:08:10.3596
29212025200483	ترتيل زكريا حسين حسن محمد سعيد	123456	1	2	2026-04-04 08:22:36.630081	2026-04-04 15:08:10.3596
29212025200484	جني محمد السيد محمد السيد عثمان	123456	1	2	2026-04-04 08:22:36.846228	2026-04-04 15:08:10.3596
29212025100654	جوده محمد حسن جوده حسن الموافي	123456	1	2	2026-04-04 08:22:37.061847	2026-04-04 15:08:10.3596
29212025100485	حازم ايمن عبدالعزيز عبدالمعطي حسن	123456	1	2	2026-04-04 08:22:37.277434	2026-04-04 15:08:10.3596
29212025100486	حازم محمد حسن محمد الشهيدي	123456	1	2	2026-04-04 08:22:37.492232	2026-04-04 15:08:10.3596
29212025100490	رامز صابر محمد حفناوي	123456	1	2	2026-04-04 08:22:39.004039	2026-04-04 15:08:10.3596
29212025200644	راندا عادل عبداللطيف مهدي شريف	123456	1	2	2026-04-04 08:22:39.219398	2026-04-04 15:08:10.3596
29212025200706	رحمه محمد عبدالمعطي ابراهيم سالم	123456	1	2	2026-04-04 08:22:39.436509	2026-04-04 15:08:10.3596
29212025200492	رقيه حماده احمد محمد محمد يونس	123456	1	2	2026-04-04 08:22:39.652251	2026-04-04 15:08:10.3596
29212025100657	رمضان احمد محمود السيد عوض ﷲ	123456	1	2	2026-04-04 08:22:39.866861	2026-04-04 15:08:10.3596
29212025100658	رمضان محمد رمضان محمد عبدالعال	123456	1	2	2026-04-04 08:22:40.083549	2026-04-04 15:08:10.3596
29212025200659	روان خليل ذكي عثمان احمد خليل	123456	1	2	2026-04-04 08:22:40.298901	2026-04-04 15:08:10.3596
29212025200493	روان محمد حبيب علي السيد الكومي	123456	1	2	2026-04-04 08:22:40.515511	2026-04-04 15:08:10.3596
29212025200494	روضه وليد محمد محمد الباز	123456	1	2	2026-04-04 08:22:40.731755	2026-04-04 15:08:10.3596
29212025200496	ريم سامي الصيفي طلبه صالح	123456	1	2	2026-04-04 08:22:41.162578	2026-04-04 15:08:10.3596
29212025100650	السيد عصام السيد عزازي محمد	123456	1	2	2026-04-04 08:22:32.088359	2026-04-04 15:08:10.3596
29212025100699	اياد اسعد محمد يونس فرحات	123456	1	2	2026-04-04 08:22:32.953918	2026-04-04 15:08:10.3596
29212025100651	اياد سعيد سمير محمد صالح	123456	1	2	2026-04-04 08:22:33.168917	2026-04-04 15:08:10.3596
29212025100652	اياد عبدالبديع محمد علي محمد	123456	1	2	2026-04-04 08:22:33.395902	2026-04-04 15:08:10.3596
29212025200474	ايمان ايمن عبدالفتاح فراج مصطفي	123456	1	2	2026-04-04 08:22:33.610594	2026-04-04 15:08:10.3596
29212025200475	ايمان محمد توفيق سند محمد سالم	123456	1	2	2026-04-04 08:22:33.825981	2026-04-04 15:08:10.3596
29212025100967	ايمن محمد عبداللطيف حسن علي	123456	1	2	2026-04-04 08:22:34.041518	2026-04-04 15:08:10.3596
29212025100476	ايهاب محمد سالم السعيد سالم	123456	1	2	2026-04-04 08:22:34.256564	2026-04-04 15:08:10.3596
29212025100478	بدر محمد جوده محمد حسن فرير	123456	1	2	2026-04-04 08:22:34.472661	2026-04-04 15:08:10.3596
29212025200653	بسمله عصام محمد يوسف	123456	1	2	2026-04-04 08:22:34.688801	2026-04-04 15:08:10.3596
29212025200971	بسمه رجب محمد علي مصطفي	123456	1	2	2026-04-04 08:22:35.119111	2026-04-04 15:08:10.3596
29212025200977	بسنت احمد ابوهاشم نصر ﷲ	123456	1	2	2026-04-04 08:22:35.334273	2026-04-04 15:08:10.3596
29212025100488	حسن سامح حسن محمد احمد السيد احمد	123456	1	2	2026-04-04 08:22:38.358643	2026-04-04 15:08:10.3596
29212025200489	حنين كامل ابراهيم عبدالعال ابراهيم	123456	1	2	2026-04-04 08:22:38.573707	2026-04-04 15:08:10.3596
29212025100491	رائد حاتم صﻼح الدين ابراهيم علي	123456	1	2	2026-04-04 08:22:38.789052	2026-04-04 15:08:10.3596
29212025100660	زياد خلف علي احمد لقلق	123456	1	2	2026-04-04 08:22:41.594995	2026-04-04 15:08:10.3596
29212025100498	زياد عبدالعزيز السيد ابراهيم محمد	123456	1	2	2026-04-04 08:22:41.810255	2026-04-04 15:08:10.3596
29212025100499	زياد عماد عبدالمنعم محمد عبدالجواد	123456	1	2	2026-04-04 08:22:42.025372	2026-04-04 15:08:10.3596
29212025100500	زياد محمد سعيد عبدالمنعم احمد قمحاوي	123456	1	2	2026-04-04 08:22:42.240415	2026-04-04 15:08:10.3596
29212025100501	سالم محمد السيد سالم محمد	123456	1	2	2026-04-04 08:22:42.455879	2026-04-04 15:08:10.3596
29212025100502	سامي احمد ابراهيم فهمي محمد	123456	1	2	2026-04-04 08:22:42.671802	2026-04-04 15:08:10.3596
29212025200513	شهد السيد محمد محمود حسن	123456	1	3	2026-04-04 08:22:46.121927	2026-04-04 15:08:10.440622
29212025200708	شهد سامي محمد عكاشه علي	123456	1	3	2026-04-04 08:22:46.337821	2026-04-04 15:08:10.440622
29212025200515	شهد محمد ابراهيم يوسف اﻻفندي	123456	1	3	2026-04-04 08:22:46.768827	2026-04-04 15:08:10.440622
29212025100516	صﻼح وحيد لطفي السيد العزب	123456	1	3	2026-04-04 08:22:46.984146	2026-04-04 15:08:10.440622
29212025100519	عبدالحميد هشام عبدالحميد حسن ابراهيم	123456	1	3	2026-04-04 08:22:47.19922	2026-04-04 15:08:10.440622
29212025100520	عبدالخالق الهادي عبدالخالق عبدالباقي	123456	1	3	2026-04-04 08:22:47.414393	2026-04-04 15:08:10.440622
29212025100664	عبدالخالق عبدالحليم عبدالخالق متولي داود	123456	1	3	2026-04-04 08:22:47.629841	2026-04-04 15:08:10.440622
29212025100643	عبدالرحمن احمد محمد عبدالحميد طنطاوي	123456	1	3	2026-04-04 08:22:47.845805	2026-04-04 15:08:10.440622
29212025100517	عبدالرحمن ايمن عاطف فتحي	123456	1	3	2026-04-04 08:22:48.061547	2026-04-04 15:08:10.440622
29212025100640	عبدالرحمن ايهاب لطفي حسن العﻼم	123456	1	3	2026-04-04 08:22:48.277313	2026-04-04 15:08:10.440622
29212025100529	عبدﷲ السيد عبدﷲ الغريب سﻼم سليمان	123456	1	3	2026-04-04 08:22:51.083526	2026-04-04 15:08:10.440622
29212025100539	علي محمود محمد مناع يوسف	123456	1	3	2026-04-04 08:22:53.481101	2026-04-04 15:08:10.440622
29212025100964	محمد فؤاد لطفي فؤاد مندور	123456	1	5	2026-04-04 08:23:06.894299	2026-04-04 15:08:10.601506
29212025100580	محمد فايز محمد رضا محمد علي	123456	1	5	2026-04-04 08:23:07.10959	2026-04-04 15:08:10.601506
29212025100642	محمد فتحي ابراهيم محمود نصر	123456	1	5	2026-04-04 08:23:07.325343	2026-04-04 15:08:10.601506
29212025100582	محمد فتحي محمد عيد ابراهيم	123456	1	5	2026-04-04 08:23:07.756392	2026-04-04 15:08:10.601506
29212025100677	محمد محسن محمد عبدالعال الحوت	123456	1	5	2026-04-04 08:23:08.402271	2026-04-04 15:08:10.601506
29212025100585	محمد محمود ابراهيم محمود سالم	123456	1	5	2026-04-04 08:23:08.618046	2026-04-04 15:08:10.601506
29212025100586	محمد محمود عبداللطيف احمد محمد	123456	1	5	2026-04-04 08:23:08.833631	2026-04-04 15:08:10.601506
29212025100587	محمد محمود محمد شوقي الجبالي	123456	1	5	2026-04-04 08:23:09.048548	2026-04-04 15:08:10.601506
29212025100588	محمد محمود محمد مبارك موسي	123456	1	5	2026-04-04 08:23:09.263523	2026-04-04 15:08:10.601506
29212025100589	محمد مسعود حسن حامد مرسي	123456	1	5	2026-04-04 08:23:09.479183	2026-04-04 15:08:10.601506
29212025100590	محمد ممدوح مصطفي محمد مصطفي الرصاص	123456	1	5	2026-04-04 08:23:09.697103	2026-04-04 15:08:10.601506
29212025100591	محمد نادر السيد احمد منير ابراهيم	123456	1	5	2026-04-04 08:23:09.925137	2026-04-04 15:08:10.601506
29212025100593	محمد هاني ابوالفتوح عبدالعزيز سﻼمه	123456	1	5	2026-04-04 08:23:10.140539	2026-04-04 15:08:10.601506
29212025100572	محمد صﻼح محمد فرج	123456	1	5	2026-04-04 08:23:04.729056	2026-04-04 15:08:10.601506
29212025100584	محمد ماهر رشدي محمد السيد	123456	1	5	2026-04-04 08:23:08.187321	2026-04-04 15:08:10.601506
29212025100595	محمد يوسف ابراهيم يوسف يوسف	123456	1	5	2026-04-04 08:23:10.571892	2026-04-04 15:08:10.601506
29212025100596	محمود اسماعيل محمود محمد حسن القواص	123456	1	5	2026-04-04 08:23:10.787207	2026-04-04 15:08:10.601506
29212025100597	محمود بنداري محمود احمد حجازي	123456	1	5	2026-04-04 08:23:11.001963	2026-04-04 15:08:10.601506
29212025100678	محمود شعبان مبارك احمد محمد	123456	1	5	2026-04-04 08:23:11.217289	2026-04-04 15:08:10.601506
29212025100598	محمود عبدالحميد محمود عرفات	123456	1	5	2026-04-04 08:23:11.433081	2026-04-04 15:08:10.601506
29212025100599	محمود عبدالعظيم محمد سليم فياض	123456	1	5	2026-04-04 08:23:11.648618	2026-04-04 15:08:10.601506
29212025100679	محمود ياسر محمود عبدالمنعم عبدالسﻼم	123456	1	5	2026-04-04 08:23:11.864249	2026-04-04 15:08:10.601506
29212025100680	مروان ياسر محمود علي عطيه	123456	1	5	2026-04-04 08:23:12.0795	2026-04-04 15:08:10.601506
29212025200600	مريم نبيل مصطفي محمد اليماني	123456	1	5	2026-04-04 08:23:12.294891	2026-04-04 15:08:10.601506
29212025200963	مريم هاني محمد مبروك شبيب	123456	1	5	2026-04-04 08:23:12.510046	2026-04-04 15:08:10.601506
29212025200601	مريم ياسر صبري احمد عبدالسﻼم	123456	1	5	2026-04-04 08:23:12.726081	2026-04-04 15:08:10.601506
29212025100602	مصطفي احمد عبده عطيه	123456	1	5	2026-04-04 08:23:12.942199	2026-04-04 15:08:10.601506
29212025100604	مصطفي صالح مصطفي صالح العزوني	123456	1	5	2026-04-04 08:23:13.589209	2026-04-04 15:08:10.601506
29212025100603	مصطفي احمد محمد محمود عبدﷲ العمري	123456	1	5	2026-04-04 08:23:13.158233	2026-04-04 15:08:10.601506
29212025100571	محمد صﻼح محمد عيد السيد	123456	1	5	2026-04-04 08:23:04.512461	2026-04-04 15:08:10.601506
29212025100628	يوسف ايمن ابراهيم عبدالعزيز ابراهيم	123456	1	6	2026-04-04 08:23:20.497676	2026-04-04 15:08:10.680651
29212025100698	يوسف هاني حلمي حلمي حسن	123456	1	6	2026-04-04 08:23:24.598152	2026-04-04 15:08:10.680651
29212025100714	يوسف هاني محمد محمد محمد شلبي	123456	1	6	2026-04-04 08:23:24.81446	2026-04-04 15:08:10.680651
29212025100969	يوسف وائل عبدﷲ محمد ابراهيم	123456	1	6	2026-04-04 08:23:25.245628	2026-04-04 15:08:10.680651
\.


--
-- Data for Name: timetable; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.timetable (id, section, day_of_week, start_time, end_time, course_name, location, instructor, type, created_at, updated_at) FROM stdin;
1	A	Monday	09:00:00	11:00:00	Programming 2	Hall 4B	Dr. Mahmoud El-Namouly	Lecture	2026-04-04 06:49:30.918057	2026-04-04 06:49:30.918057
2	A	Monday	11:00:00	13:00:00	Programming 2 Lab	Lab 304	TA Ahmed	Lab	2026-04-04 06:49:30.918057	2026-04-04 06:49:30.918057
3	A	Tuesday	10:00:00	12:00:00	Mathematics 2	Hall 2A	Dr. Aml Farouk	Lecture	2026-04-04 06:49:30.918057	2026-04-04 06:49:30.918057
4	A	Wednesday	09:00:00	11:00:00	Digital Logic Design	Lab 202	Dr. Khaled Hosny	Lab	2026-04-04 06:49:30.918057	2026-04-04 06:49:30.918057
5	A	Thursday	10:00:00	12:00:00	Operation Research	Hall 3C	Dr. Sherine Zaki	Lecture	2026-04-04 06:49:30.918057	2026-04-04 06:49:30.918057
6	A	Thursday	12:00:00	14:00:00	Social Ethical	Hall 1ZA	Dr. Aml Zaki	Lecture	2026-04-04 06:49:30.918057	2026-04-04 06:49:30.918057
7	B	Monday	11:00:00	13:00:00	Programming 2	Hall 4B	Dr. Mahmoud El-Namouly	Lecture	2026-04-04 06:49:31.008258	2026-04-04 06:49:31.008258
8	B	Tuesday	09:00:00	11:00:00	Mathematics 2	Hall 2A	Dr. Aml Farouk	Lecture	2026-04-04 06:49:31.008258	2026-04-04 06:49:31.008258
9	B	Wednesday	11:00:00	13:00:00	Digital Logic Design	Lab 202	Dr. Khaled Hosny	Lab	2026-04-04 06:49:31.008258	2026-04-04 06:49:31.008258
10	B	Thursday	09:00:00	11:00:00	Operation Research	Hall 3C	Dr. Sherine Zaki	Lecture	2026-04-04 06:49:31.008258	2026-04-04 06:49:31.008258
11	1	Monday	09:00:00	11:00:00	Programming 2	Hall 4B	Dr. Mahmoud El-Namouly	Lecture	2026-04-04 13:51:58.718741	2026-04-04 13:51:58.718741
12	1	Tuesday	10:00:00	12:00:00	Mathematics 2	Hall 2A	Dr. Aml Farouk	Lecture	2026-04-04 13:51:58.718741	2026-04-04 13:51:58.718741
13	1	Wednesday	09:00:00	11:00:00	Digital Logic Design	Lab 202	Dr. Khaled Hosny	Lab	2026-04-04 13:51:58.718741	2026-04-04 13:51:58.718741
14	2	Monday	11:00:00	13:00:00	Programming 2	Hall 4B	Dr. Mahmoud El-Namouly	Lecture	2026-04-04 13:51:58.833384	2026-04-04 13:51:58.833384
15	2	Tuesday	09:00:00	11:00:00	Mathematics 2	Hall 2A	Dr. Aml Farouk	Lecture	2026-04-04 13:51:58.833384	2026-04-04 13:51:58.833384
\.


--
-- Name: announcements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.announcements_id_seq', 1, false);


--
-- Name: career_tracks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.career_tracks_id_seq', 5, true);


--
-- Name: courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.courses_id_seq', 6, true);


--
-- Name: grades_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.grades_id_seq', 1082, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.notifications_id_seq', 6, true);


--
-- Name: resources_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.resources_id_seq', 1, false);


--
-- Name: roadmap_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.roadmap_items_id_seq', 5, true);


--
-- Name: roadmap_stages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.roadmap_stages_id_seq', 1, false);


--
-- Name: roadmap_tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.roadmap_tasks_id_seq', 21, true);


--
-- Name: roadmaps_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.roadmaps_id_seq', 1, false);


--
-- Name: student_courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.student_courses_id_seq', 1, false);


--
-- Name: student_roadmap_progress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.student_roadmap_progress_id_seq', 1, false);


--
-- Name: student_task_progress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.student_task_progress_id_seq', 1, false);


--
-- Name: student_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.student_users_id_seq', 1, false);


--
-- Name: timetable_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.timetable_id_seq', 15, true);


--
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- Name: career_tracks career_tracks_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.career_tracks
    ADD CONSTRAINT career_tracks_pkey PRIMARY KEY (id);


--
-- Name: courses courses_name_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_name_key UNIQUE (name);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: grades grades_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_pkey PRIMARY KEY (id);


--
-- Name: grades grades_student_id_course_name_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_student_id_course_name_key UNIQUE (student_id, course_name);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: resources resources_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_pkey PRIMARY KEY (id);


--
-- Name: roadmap_items roadmap_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.roadmap_items
    ADD CONSTRAINT roadmap_items_pkey PRIMARY KEY (id);


--
-- Name: roadmap_stages roadmap_stages_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.roadmap_stages
    ADD CONSTRAINT roadmap_stages_pkey PRIMARY KEY (id);


--
-- Name: roadmap_tasks roadmap_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.roadmap_tasks
    ADD CONSTRAINT roadmap_tasks_pkey PRIMARY KEY (id);


--
-- Name: roadmaps roadmaps_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.roadmaps
    ADD CONSTRAINT roadmaps_pkey PRIMARY KEY (id);


--
-- Name: student_courses student_courses_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.student_courses
    ADD CONSTRAINT student_courses_pkey PRIMARY KEY (id);


--
-- Name: student_courses student_courses_student_id_course_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.student_courses
    ADD CONSTRAINT student_courses_student_id_course_id_key UNIQUE (student_id, course_id);


--
-- Name: student_roadmap_progress student_roadmap_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.student_roadmap_progress
    ADD CONSTRAINT student_roadmap_progress_pkey PRIMARY KEY (id);


--
-- Name: student_roadmap_progress student_roadmap_progress_student_id_roadmap_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.student_roadmap_progress
    ADD CONSTRAINT student_roadmap_progress_student_id_roadmap_id_key UNIQUE (student_id, roadmap_id);


--
-- Name: student_task_progress student_task_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.student_task_progress
    ADD CONSTRAINT student_task_progress_pkey PRIMARY KEY (id);


--
-- Name: student_task_progress student_task_progress_student_id_task_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.student_task_progress
    ADD CONSTRAINT student_task_progress_student_id_task_id_key UNIQUE (student_id, task_id);


--
-- Name: student_users student_users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.student_users
    ADD CONSTRAINT student_users_pkey PRIMARY KEY (id);


--
-- Name: student_users student_users_student_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.student_users
    ADD CONSTRAINT student_users_student_id_key UNIQUE (student_id);


--
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);


--
-- Name: timetable timetable_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.timetable
    ADD CONSTRAINT timetable_pkey PRIMARY KEY (id);


--
-- Name: idx_grades_course_name; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_grades_course_name ON public.grades USING btree (course_name);


--
-- Name: idx_grades_student_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_grades_student_id ON public.grades USING btree (student_id);


--
-- Name: idx_notifications_student_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_notifications_student_id ON public.notifications USING btree (student_id);


--
-- Name: idx_resources_course_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_resources_course_id ON public.resources USING btree (course_id);


--
-- Name: idx_roadmap_stages_roadmap; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_roadmap_stages_roadmap ON public.roadmap_stages USING btree (roadmap_id);


--
-- Name: idx_student_courses_course; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_student_courses_course ON public.student_courses USING btree (course_id);


--
-- Name: idx_student_courses_student; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_student_courses_student ON public.student_courses USING btree (student_id);


--
-- Name: idx_student_progress_student_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_student_progress_student_id ON public.student_task_progress USING btree (student_id);


--
-- Name: idx_student_roadmap_student; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_student_roadmap_student ON public.student_roadmap_progress USING btree (student_id);


--
-- Name: idx_timetable_section; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_timetable_section ON public.timetable USING btree (section);


--
-- Name: courses update_courses_updated_at; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: grades update_grades_updated_at; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER update_grades_updated_at BEFORE UPDATE ON public.grades FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: students update_students_updated_at; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: grades grades_course_name_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_course_name_fkey FOREIGN KEY (course_name) REFERENCES public.courses(name) ON DELETE CASCADE;


--
-- Name: grades grades_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- Name: resources resources_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: roadmap_stages roadmap_stages_roadmap_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.roadmap_stages
    ADD CONSTRAINT roadmap_stages_roadmap_id_fkey FOREIGN KEY (roadmap_id) REFERENCES public.roadmaps(id) ON DELETE CASCADE;


--
-- Name: roadmap_tasks roadmap_tasks_track_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.roadmap_tasks
    ADD CONSTRAINT roadmap_tasks_track_id_fkey FOREIGN KEY (track_id) REFERENCES public.career_tracks(id) ON DELETE CASCADE;


--
-- Name: student_roadmap_progress student_roadmap_progress_current_stage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.student_roadmap_progress
    ADD CONSTRAINT student_roadmap_progress_current_stage_id_fkey FOREIGN KEY (current_stage_id) REFERENCES public.roadmap_stages(id) ON DELETE SET NULL;


--
-- Name: student_roadmap_progress student_roadmap_progress_roadmap_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.student_roadmap_progress
    ADD CONSTRAINT student_roadmap_progress_roadmap_id_fkey FOREIGN KEY (roadmap_id) REFERENCES public.roadmaps(id) ON DELETE CASCADE;


--
-- Name: student_task_progress student_task_progress_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.student_task_progress
    ADD CONSTRAINT student_task_progress_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- Name: student_task_progress student_task_progress_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.student_task_progress
    ADD CONSTRAINT student_task_progress_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.roadmap_tasks(id) ON DELETE CASCADE;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

\unrestrict MbvgZXvauuKgKLVbOcwv4ChqNWVe4BR1BOGzNNcQ5nUHHUbi8bVmPsWExTcAAuu

