--
-- PostgreSQL database dump
--

\restrict DuwvFeEcYh6SWcjNH1qErO14K0FeiP8GAv2Gm0mBRQjjML3BYfKA8zDgTPBUeGP

-- Dumped from database version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)
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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: announcements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.announcements (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.announcements OWNER TO postgres;

--
-- Name: announcements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.announcements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.announcements_id_seq OWNER TO postgres;

--
-- Name: announcements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.announcements_id_seq OWNED BY public.announcements.id;


--
-- Name: courses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.courses (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    semester integer NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    max_score integer DEFAULT 15 NOT NULL,
    CONSTRAINT courses_semester_check CHECK ((semester = ANY (ARRAY[1, 2])))
);


ALTER TABLE public.courses OWNER TO postgres;

--
-- Name: courses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.courses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.courses_id_seq OWNER TO postgres;

--
-- Name: courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.courses_id_seq OWNED BY public.courses.id;


--
-- Name: grades; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.grades (
    id integer NOT NULL,
    student_id character varying(50) NOT NULL,
    course_name character varying(255) NOT NULL,
    midterm_score numeric(5,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT grades_midterm_score_check CHECK (((midterm_score >= (0)::numeric) AND (midterm_score <= (100)::numeric)))
);


ALTER TABLE public.grades OWNER TO postgres;

--
-- Name: grades_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.grades_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.grades_id_seq OWNER TO postgres;

--
-- Name: grades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.grades_id_seq OWNED BY public.grades.id;


--
-- Name: resources; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resources (
    id integer NOT NULL,
    course_id integer NOT NULL,
    type character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    url text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT resources_type_check CHECK (((type)::text = ANY ((ARRAY['video'::character varying, 'pdf'::character varying, 'summary'::character varying])::text[])))
);


ALTER TABLE public.resources OWNER TO postgres;

--
-- Name: resources_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.resources_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.resources_id_seq OWNER TO postgres;

--
-- Name: resources_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.resources_id_seq OWNED BY public.resources.id;


--
-- Name: roadmap_items; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.roadmap_items OWNER TO postgres;

--
-- Name: roadmap_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roadmap_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roadmap_items_id_seq OWNER TO postgres;

--
-- Name: roadmap_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roadmap_items_id_seq OWNED BY public.roadmap_items.id;


--
-- Name: students; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.students (
    id character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.students OWNER TO postgres;

--
-- Name: announcements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements ALTER COLUMN id SET DEFAULT nextval('public.announcements_id_seq'::regclass);


--
-- Name: courses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses ALTER COLUMN id SET DEFAULT nextval('public.courses_id_seq'::regclass);


--
-- Name: grades id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades ALTER COLUMN id SET DEFAULT nextval('public.grades_id_seq'::regclass);


--
-- Name: resources id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resources ALTER COLUMN id SET DEFAULT nextval('public.resources_id_seq'::regclass);


--
-- Name: roadmap_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roadmap_items ALTER COLUMN id SET DEFAULT nextval('public.roadmap_items_id_seq'::regclass);


--
-- Data for Name: announcements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.announcements (id, title, content, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.courses (id, name, semester, description, created_at, updated_at, max_score) FROM stdin;
7	programming 1	1	Dr / Doaa El-Shahat	2026-04-02 05:59:54.050035	2026-04-02 05:59:54.050035	15
8	Mathematics 1	1	Dr / Wafaa Tawfik	2026-04-02 10:27:56.336769	2026-04-02 10:27:56.336769	15
9	Computational thinking	1	Dr / Abdullah Gamal	2026-04-02 10:30:21.798438	2026-04-02 10:30:21.798438	15
11	Physics	1	Dr / Hasnaa Raafat	2026-04-02 10:32:04.331518	2026-04-02 10:32:04.331518	15
12	Math 0	1	Dr / Amal Farouk	2026-04-02 10:32:43.111192	2026-04-02 10:32:43.111192	15
10	Statistics and Probability	1	Dr / Mahmoud Ismail	2026-04-02 10:31:27.786258	2026-04-02 12:20:15.601431	15
6	Social Ethical	2	Dr / Aml Zaki	2026-04-01 07:19:37.834574	2026-04-02 12:23:48.994934	15
1	Programming 2	2	Dr / Mahmoud El-Namouly	2026-04-01 07:19:37.834574	2026-04-02 12:24:41.329739	15
5	Mathematics 2	2	Dr / Aml Farouk	2026-04-01 07:19:37.834574	2026-04-02 12:25:15.657661	15
2	Discrete Mathematics	2	Dr / Abduallah Gamal	2026-04-01 07:19:37.834574	2026-04-02 12:25:39.885162	15
3	Digital Logic Design	2	Dr / Khaled Hosny	2026-04-01 07:19:37.834574	2026-04-02 12:26:01.309706	15
4	Operation Research	2	Dr / Sherine Zaki	2026-04-01 07:19:37.834574	2026-04-02 12:27:49.304244	15
13	English	1	Dr / Mohammed Abd El-halim	2026-04-02 10:35:43.836335	2026-04-02 12:28:11.028979	15
\.


--
-- Data for Name: grades; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.grades (id, student_id, course_name, midterm_score, created_at, updated_at) FROM stdin;
5	12345	programming 2	15.00	2026-04-01 16:52:31.021049	2026-04-01 16:52:31.021049
6	12345	Social Ethical	15.00	2026-04-02 21:03:14.65578	2026-04-02 21:03:14.65578
7	12345	Operation Research	5.00	2026-04-02 21:04:25.276262	2026-04-02 21:04:25.276262
\.


--
-- Data for Name: resources; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resources (id, course_id, type, title, url, created_at, updated_at) FROM stdin;
44	6	pdf	Book	https://drive.google.com/file/d/1GvNMP67aVh6_6_dMttOXDNdo-81Q8WT2/view?usp=drive_link	2026-04-02 21:36:21.977076	2026-04-02 21:36:47.634104
5	5	summary	Summaries	https://drive.google.com/drive/folders/1ico3PsP-xNNWHFE1_wVM6hV-FRoeKp3I?usp=drive_link	2026-04-02 14:12:35.255971	2026-04-02 14:12:35.255971
7	9	pdf	python	https://drive.google.com/file/d/19oo3MvlBuxL6JebtDy_girTsarvY9Pkn/view?usp=drive_link	2026-04-02 21:09:57.464666	2026-04-02 21:09:57.464666
8	9	pdf	Lecture 1	https://drive.google.com/file/d/1j0Ij6cEQtYYcKmS4Ok8LyT3tOVtmRbNu/view?usp=drive_link	2026-04-02 21:10:21.700444	2026-04-02 21:10:21.700444
9	9	pdf	Lecture 2	https://drive.google.com/file/d/1_1Hl756aflSXu_UtJ-SbRnS9WFBNiCqo/view?usp=drive_link	2026-04-02 21:10:55.93085	2026-04-02 21:10:55.93085
10	9	pdf	Lecture 2 part 2	https://drive.google.com/file/d/1TXIgogOlju8O8H6_-tQuLL-3RbzpFxPc/view?usp=drive_link	2026-04-02 21:11:12.118194	2026-04-02 21:11:12.118194
11	9	pdf	Lecture 3	https://drive.google.com/file/d/14F0k6HAl4i5o7hK5m_R9MwKB8h2f40oq/view?usp=drive_link	2026-04-02 21:11:41.264043	2026-04-02 21:11:41.264043
12	9	pdf	Lecture 4	https://drive.google.com/file/d/1ztXmtSazHI6jHzq_vxicCnYJ2ZvLCuy0/view?usp=drive_link	2026-04-02 21:12:02.950236	2026-04-02 21:12:02.950236
13	9	pdf	Lecture 4 & 5	https://drive.google.com/file/d/1LQjylP8xrT0gcWLXkIXprl1PPNmlU9dn/view?usp=drive_link	2026-04-02 21:12:28.801638	2026-04-02 21:12:28.801638
14	9	pdf	Examples Algorithms and Flowcharts	https://drive.google.com/file/d/10SpACwDiCx2bhUdTjTjsChR0lRxuOoKF/view?usp=drive_link	2026-04-02 21:13:10.556739	2026-04-02 21:13:10.556739
15	9	pdf	computational thinking book	https://drive.google.com/file/d/1VjKNxrZC-dmb4eOKBz2SPu4v2UOCxMGl/view?usp=drive_link	2026-04-02 21:13:32.427144	2026-04-02 21:14:12.741333
17	13	pdf	English Book	https://drive.google.com/file/d/1DOsDixvtLq0DTc1d8s1gowOA3O7jFLK8/view?usp=drive_link	2026-04-02 21:17:21.23437	2026-04-02 21:17:21.23437
18	12	pdf	Book	https://drive.google.com/file/d/11brakG2Voj5JgdSSpt7zd4mmQnRNcH5j/view?usp=drive_link	2026-04-02 21:18:26.149367	2026-04-02 21:18:26.149367
19	12	pdf	Exercise	https://drive.google.com/file/d/1kaZ7C7GwJ9AOUpcPBCZ1XbSaWFX2_Scz/view?usp=drive_link	2026-04-02 21:18:44.377653	2026-04-02 21:18:44.377653
20	12	pdf	Unit 1 (1.1)	https://drive.google.com/file/d/1p6nYrRppxdvk3LF0cBuWOk83cNZUIlcg/view?usp=drive_link	2026-04-02 21:19:57.572542	2026-04-02 21:19:57.572542
21	12	pdf	Unit 1 (1.2)	https://drive.google.com/file/d/1nCGDo3KrQzhEL8Ip1P7CZ8KV0jlsWSmQ/view?usp=drive_link	2026-04-02 21:20:23.175976	2026-04-02 21:20:23.175976
22	12	pdf	Unit 1 (1.3 , 1.4)	https://drive.google.com/file/d/1vjvz7hWJDxUbz7mK554K5cbRRUWJeq1u/view?usp=drive_link	2026-04-02 21:20:51.579904	2026-04-02 21:20:51.579904
23	12	pdf	Unit 2	https://drive.google.com/file/d/1rVFN2RX98eEem0k2kSQnAXcAuj7qyrlO/view?usp=drive_link	2026-04-02 21:21:19.931346	2026-04-02 21:21:19.931346
24	12	pdf	Unit 3 part 1	https://drive.google.com/file/d/1DyoYlPssnhAveg-L04JPuzQpIuuNsPPe/view?usp=drive_link	2026-04-02 21:21:44.262216	2026-04-02 21:21:44.262216
25	11	pdf	Chapter 1	https://drive.google.com/file/d/1qk_VTsGN03CIbpWlFIHxA_eJeuJwSKtc/view?usp=drive_link	2026-04-02 21:23:05.55772	2026-04-02 21:23:05.55772
26	11	pdf	Chapter 2 part1	https://drive.google.com/file/d/1YEGb90x-icY5P9ZhlyQlyCJuIYKDpRy6/view?usp=drive_link	2026-04-02 21:23:38.09922	2026-04-02 21:23:38.09922
27	11	pdf	Chapter 2 part 2	https://drive.google.com/file/d/17qmURos_wdqgrzCrHYU4xkjDdh82laVC/view?usp=drive_link	2026-04-02 21:23:56.398567	2026-04-02 21:23:56.398567
28	11	pdf	Chapter 3	https://drive.google.com/file/d/1uqLtegA6fBDunpUqyXxuVgGYoFT_4pfd/view?usp=drive_link	2026-04-02 21:24:12.548344	2026-04-02 21:24:12.548344
29	11	pdf	Chapter 4 part 1	https://drive.google.com/file/d/1KyDsXn4A-zhxxSXZgLJo9JfTBz52J8B7/view?usp=drive_link	2026-04-02 21:24:35.596448	2026-04-02 21:24:35.596448
30	11	pdf	Chapter 4 part 2	https://drive.google.com/file/d/1SHXjJi48b-z2qnbgciRGN8hiI7EQTVx6/view?usp=drive_link	2026-04-02 21:24:51.29585	2026-04-02 21:24:51.29585
32	11	pdf	Definitions	https://drive.google.com/file/d/1WQyxQXG3URYnyld4IwJEQ_Gf1ytGo5Nh/view?usp=drive_link	2026-04-02 21:25:24.641555	2026-04-02 21:25:24.641555
33	11	pdf	Book	https://drive.google.com/file/d/1SewFJyEJeOchr4tf53PJAWAuZ_ndL2Xn/view?usp=drive_link	2026-04-02 21:26:53.389071	2026-04-02 21:26:53.389071
31	11	pdf	Chapter 5 part 1	https://drive.google.com/file/d/1RZIyjGjdoS0-vFmsXEHvCdEkvnOaRvp2/view?usp=drive_link	2026-04-02 21:25:08.279808	2026-04-02 21:27:24.139156
34	5	pdf	Book	https://drive.google.com/file/d/1RMDqAjzM_j2WVz8FFa6oZU1UZnrpiFM0/view?usp=drive_link	2026-04-02 21:30:14.244345	2026-04-02 21:30:14.244345
35	5	pdf	Math ( Sec 1 to Sec 10 )	https://drive.google.com/file/d/1x4u1V7uxdeUBHvm3UXdKoYgokSqCkdPn/view?usp=drive_link	2026-04-02 21:30:59.021852	2026-04-02 21:30:59.021852
36	4	pdf	Book	https://drive.google.com/file/d/1WUKrf97_6bI0qluq-EL2DcopQW4C7_JH/view?usp=drive_link	2026-04-02 21:32:31.285671	2026-04-02 21:32:31.285671
37	4	pdf	Lecture 1	https://drive.google.com/file/d/1ueTrL5tQ4X4Vd3zUVijvH0Cr_zNCJ1iX/view?usp=drive_link	2026-04-02 21:33:17.781722	2026-04-02 21:33:17.781722
38	4	pdf	Lecture 2	https://docs.google.com/presentation/d/1xfkgd8bjtzkxp5URbhLIc_zGqL9UX_Bx/edit?usp=drive_link&ouid=106121503634640510980&rtpof=true&sd=true	2026-04-02 21:33:31.542154	2026-04-02 21:33:31.542154
39	4	pdf	Lecture 3	https://drive.google.com/file/d/14jQ9Ts_Hv8XN0zFPmdl7pgddKFulWmZP/view?usp=drive_link	2026-04-02 21:33:50.139077	2026-04-02 21:33:50.139077
40	4	pdf	Chapter 1	https://drive.google.com/file/d/1PdeCr73I8GpRX_YUqlOFbcdy8REbyf8G/view?usp=drive_link	2026-04-02 21:34:44.918511	2026-04-02 21:34:44.918511
41	4	pdf	Chapter 2	https://drive.google.com/file/d/1ui49GZSFxOQnKM2qh3tC0CeTo8VEJuqY/view?usp=drive_link	2026-04-02 21:34:58.393954	2026-04-02 21:34:58.393954
42	4	pdf	Chapter 3	https://drive.google.com/file/d/1ZSEkAW9-WsRBSxJn3zv-LuniHK6nnY6Z/view?usp=drive_link	2026-04-02 21:35:10.13475	2026-04-02 21:35:10.13475
43	4	pdf	Chapter 4	https://drive.google.com/file/d/1jZKURo4wyZz6kglPJkGIlt-LBHM5FF3s/view?usp=drive_link	2026-04-02 21:35:22.839547	2026-04-02 21:35:22.839547
45	6	pdf	Chapter 1	https://drive.google.com/file/d/1LK2ZIaNdx3d3mNFnCHl_iRBaTTLIbAXS/view?usp=drive_link	2026-04-02 21:37:42.922826	2026-04-02 21:37:42.922826
46	6	pdf	Chapter 2	https://drive.google.com/file/d/1OMNbEUu4slE31CmDfky3qHwu3ws25ns3/view?usp=drive_link	2026-04-02 21:37:54.000074	2026-04-02 21:37:54.000074
47	6	pdf	Chapter 3	https://drive.google.com/file/d/1QKfEwgd1GU7cDbkJUc8YDfAgkkqkJtZh/view?usp=drive_link	2026-04-02 21:38:06.398837	2026-04-02 21:38:06.398837
48	6	video	Social Ethical	https://www.youtube.com/embed/mOPp6zWHCP4	2026-04-02 21:39:07.813787	2026-04-02 21:39:07.813787
49	2	pdf	Book	https://drive.google.com/file/d/1f2twnvE2fLfPhEwF-wWrtT4KM7sfhC3O/view?usp=drive_link	2026-04-02 21:41:23.808083	2026-04-02 21:41:23.808083
50	2	pdf	Chapter 1	https://drive.google.com/file/d/1Q092PpSqjeac_atFsnW6sP8h2yZg3kuW/view?usp=drive_link	2026-04-02 21:41:42.896703	2026-04-02 21:41:48.717812
51	2	pdf	Chapter 1 part 1	https://drive.google.com/file/d/1vVhKl6LYvY76CT1Sjhce9f51mGC1c8nw/view?usp=drive_link	2026-04-02 21:42:05.596554	2026-04-02 21:42:05.596554
52	2	pdf	Chapter 2 part 1	https://drive.google.com/file/d/1MSg_2kNoZ4fFIZm4hXI7MJ7nDu1ZB7xz/view?usp=drive_link	2026-04-02 21:42:35.889026	2026-04-02 21:42:35.889026
53	2	pdf	Chapter 2 part 2	https://drive.google.com/file/d/17tILsFNz4ydHzm6M7cEazJzchxDr5uLE/view?usp=drive_link	2026-04-02 21:42:58.069403	2026-04-02 21:42:58.069403
54	3	pdf	Part 1	https://drive.google.com/file/d/1ra9OwIbhUdePnOPbTNT5HR0WXSdzJVeB/view?usp=drive_link	2026-04-02 21:44:40.843821	2026-04-02 21:44:40.843821
55	3	pdf	Part 2	https://drive.google.com/file/d/13zBX434cV9B9f6VMVZkWF02zFwhAyLoy/view?usp=drive_link	2026-04-02 21:44:52.249038	2026-04-02 21:44:52.249038
56	3	pdf	Part 3	https://drive.google.com/file/d/1i_mMzeQUL_ZgcGiq75PznVi2EeP8QvJa/view?usp=drive_link	2026-04-02 21:45:08.171952	2026-04-02 21:45:08.171952
57	3	pdf	Part 4	https://drive.google.com/file/d/1ZrO96qcrDEBu8_E3FUFvy0jHPkavZFwT/view?usp=drive_link	2026-04-02 21:45:20.049985	2026-04-02 21:45:20.049985
58	3	summary	Summaries	https://drive.google.com/drive/folders/1yd1Y6A7SHVMg-eullavK_Uq3OqCe1hQw?usp=drive_link	2026-04-02 21:45:57.860301	2026-04-02 21:45:57.860301
59	1	pdf	Lecture 1	https://drive.google.com/file/d/1H9ThZBTSLtdWDorkUcyTtCGt2SXfqE8b/view?usp=drive_link	2026-04-02 21:46:52.188079	2026-04-02 21:46:52.188079
60	1	pdf	Lecture 2	https://drive.google.com/file/d/1PskR9cBOGyELZER4ejuS52mjN3byUWb8/view?usp=drive_link	2026-04-02 21:47:05.244784	2026-04-02 21:47:05.244784
61	1	pdf	Lecture 3	https://drive.google.com/file/d/1Ef0t1-jm9xLYjx4kAsdFxrhj4Av_tj7M/view?usp=drive_link	2026-04-02 21:47:21.270413	2026-04-02 21:47:21.270413
62	1	pdf	Lecture 4	https://drive.google.com/file/d/1Xw2zuH4IkgPH6j0iUbGT8AM1GjCIzicp/view?usp=drive_link	2026-04-02 21:47:36.133572	2026-04-02 21:47:36.133572
63	1	pdf	Lecture 5	https://drive.google.com/file/d/1IO2WciMz0h8hUqtn9snjXRQyVKMR1mz-/view?usp=drive_link	2026-04-02 21:47:50.236508	2026-04-02 21:47:50.236508
64	1	pdf	Lecture 6&7	https://drive.google.com/file/d/1yYhsxZH6L1NxaaxA0BATswcz8NhCpUqJ/view?usp=drive_link	2026-04-02 21:48:19.008111	2026-04-02 21:48:19.008111
65	1	pdf	Book	https://drive.google.com/file/d/1bA_nOTNGKMUTOcy59em3vbz1VuDe7Cgf/view?usp=drive_link	2026-04-02 21:48:49.11637	2026-04-02 21:48:49.11637
\.


--
-- Data for Name: roadmap_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roadmap_items (id, title, description, video_url, order_index, created_at, updated_at) FROM stdin;
4	DevOps & Cloud Engineering	Master the art of automating software delivery. Learn Linux administration, Docker containerization, Kubernetes orchestration, and Infrastructure as Code (IaC) with Terraform and AWS.	https://youtu.be/FoTiVEbPLP0?si=HRScN_BH1T_zAiAZ	4	2026-04-02 20:31:07.03624	2026-04-02 20:31:07.03624
1	Artificial Intelligence & Data Science	Explore the world of data-driven decision making. Learn Python for data analysis, Machine Learning algorithms, Deep Learning, and how to build intelligent predictive models.	https://www.youtube.com/embed/ILrYwyPd1Dc	1	2026-04-02 09:31:59.185835	2026-04-02 20:37:34.59592
2	Web Development Basics	HTML, CSS, and JavaScript fundamentals.	https://www.youtube.com/embed/MzouYpxPl0Y	2	2026-04-02 09:31:59.185835	2026-04-02 20:38:21.60507
3	Database Design	Understanding relational databases and SQL.	https://www.youtube.com/embed/GBeWKa1Lc6I	3	2026-04-02 09:31:59.185835	2026-04-02 20:39:06.360911
5	Cyber Security	Master the fundamentals of protecting networks, systems, and data from digital attacks. Covers Network Security, Ethical Hacking, Incident Response, and Governance, Risk, and Compliance (GRC) frameworks.	https://www.youtube.com/embed/Asxu8gO1Jt4	5	2026-04-02 20:44:14.400742	2026-04-02 20:44:14.400742
\.


--
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.students (id, name, created_at, updated_at) FROM stdin;
12345	أحمد محمد محمود البنا	2026-04-01 16:52:31.018673	2026-04-01 16:52:31.018673
\.


--
-- Name: announcements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.announcements_id_seq', 1, false);


--
-- Name: courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.courses_id_seq', 13, true);


--
-- Name: grades_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.grades_id_seq', 7, true);


--
-- Name: resources_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.resources_id_seq', 65, true);


--
-- Name: roadmap_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roadmap_items_id_seq', 5, true);


--
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: grades grades_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_pkey PRIMARY KEY (id);


--
-- Name: grades grades_student_id_course_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_student_id_course_name_key UNIQUE (student_id, course_name);


--
-- Name: resources resources_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_pkey PRIMARY KEY (id);


--
-- Name: roadmap_items roadmap_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roadmap_items
    ADD CONSTRAINT roadmap_items_pkey PRIMARY KEY (id);


--
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);


--
-- Name: idx_courses_semester; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_courses_semester ON public.courses USING btree (semester);


--
-- Name: idx_grades_student_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_grades_student_id ON public.grades USING btree (student_id);


--
-- Name: idx_resources_course_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_resources_course_id ON public.resources USING btree (course_id);


--
-- Name: resources resources_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict DuwvFeEcYh6SWcjNH1qErO14K0FeiP8GAv2Gm0mBRQjjML3BYfKA8zDgTPBUeGP

