SET bookings.lang = 'ru';


/* Вывести перелеты пассажира с фамилией Solovyova,
 * с опозданием вылета более получаса,
 * забронированные в 2025 году.
 * Указать:
 * - номера брони, билета, посадочного талона
 * - id пассажира
 * - номер рейса
 * - аэропорт вылета в формате 'NAME (CITY, COUNTRY)'
 * - аэропорт прибытия в формате 'NAME (CITY, COUNTRY)'
 * - дата вылета по расписанию
 * - время прибытия и отправления по местному времени аэропорта
 * - фактическое дата/время вылета и длительность полета
 * - опоздание прибытия
 * - модель самолета
 * - класс и номер места
 **/ 
    
-- Заготовка на все join
select *
from bookings b
	inner join tickets t using(book_ref)
	inner join segments s using(ticket_no)
	inner join boarding_passes bp using(ticket_no, flight_id)
	inner join flights f using(flight_id)
	--inner join routes r on r.route_no = f.route_no AND r.validity @> f.scheduled_departure
	--inner join airplanes a on r.airplane_code = a.airplane_code 
	--inner join airports da on r.departure_airport = da.airport_code
	--inner join airports aa on r.arrival_airport = aa.airport_code 
where t.passenger_name like '%Solovyova'
	and date_part('year', b.book_date) = 2025
    and f.actual_departure > f.scheduled_departure + interval '30 minute';

    
with
tickets_of_passenger as (
	select t.*
	from bookings.tickets t
	where t.passenger_name like '%Solovyova'
)

, booking_2025 as (
	select b.*
	from bookings.bookings b
	where date_part('year', b.book_date) = 2025
)

, t_booking as (
	select t.*
	from tickets_of_passenger t
		inner join booking_2025 b using(book_ref)
)

, segments__boarding_passes as (
	select s.*
		, bp.seat_no
		, bp.boarding_no
	from bookings.segments s
		left join bookings.boarding_passes bp using(ticket_no, flight_id)
)

, t__segments as (
	select t.*
		, s.flight_id
		, s.fare_conditions
		, s.seat_no
		, s.boarding_no
	from t_booking t
		inner join segments__boarding_passes s using(ticket_no)
)

, timetable_late as (
	select
		t.flight_id
		, t.route_no
		, t.departure_airport
		, t.arrival_airport
		, t.airplane_code
		, t.scheduled_departure_local::date
		as scheduled_departure_date
		, t.scheduled_departure_local - t.scheduled_departure_local::date
		as scheduled_departure_time_local
		, t.scheduled_arrival_local - scheduled_arrival_local::date
		as scheduled_arrival_time_local
		, actual_departure_local
		as actual_departure_datetime
		, actual_arrival - actual_departure
		as actual_duration
		, actual_arrival - scheduled_arrival
		as arrival_late_interval
	from bookings.timetable t
	where t.actual_departure > t.scheduled_departure + interval '30 minute'
)

, t__timetable_late as (
	select t.*
		, tt.*
	from t__segments t
	    inner join timetable_late tt using(flight_id)
)

, airports as (
	select
		a.airport_code
		, a.airport_name || ' (' || a.city || ', ' || a.country || ')'
		as full_name
	from bookings.airports a
)

, t__airports as (
	select t.*
		, da.full_name as departure_airport_full_name
		, aa.full_name as arrival_airport_full_name
	from t__timetable_late t
		left join airports da on t.departure_airport = da.airport_code
		left join airports aa on t.arrival_airport = aa.airport_code
)

select
	 -- номера брони, билета, посадочного талона
	book_ref
	, ticket_no 
	, boarding_no
	 -- id пассажира
	, passenger_id
	 -- номер рейса
	, route_no
	 -- аэропорт вылета в формате 'NAME (CITY, COUNTRY)'
	, departure_airport_full_name
	 -- аэропорт прибытия в формате 'NAME (CITY, COUNTRY)'
	, arrival_airport_full_name
	 -- дата вылета по расписанию
	, scheduled_departure_date
	 -- время прибытия и отправления по местному времени аэропорта
	, scheduled_departure_time_local
	, scheduled_arrival_time_local
	 -- фактическое дата/время вылета и длительность полета
	, actual_departure_datetime
	, actual_duration
	 -- опоздание прибытия
	, arrival_late_interval
	 -- модель самолета
	--, airplane_model
	 -- класс и номер места
	, fare_conditions
	, seat_no
from t__airports

    
/* Вычислить среднее заполнение (доля забронированных посадочных мест)
 * по каждому маршруту за последний месяц в БД.
 * Найти рейсы с заполнением ниже среднего.
 * Вывести результат для каждого маршрута
 * по убыванию среднего заполнения.
 **/

with
routes_last_month as (
    select
        r.*
        , date_trunc('month'
        		, max(lower(r.validity)) over ()
		) as max_validity_month
    from bookings.routes r
)

, timetable_last_month_only as (
    select r.*
    		, f.flight_id
    		, f.scheduled_departure
    from routes_last_month r
		inner join flights f
			on r.route_no = f.route_no AND r.validity @> f.scheduled_departure
    where r.validity @> r.max_validity_month
)

, airplanes_seats as (
    select
		  a.airplane_code
    		, count(s.seat_no) as seats_count
    from bookings.airplanes a
    inner join bookings.seats s using (airplane_code)
    group by
		  a.airplane_code
)

, booked_seats as (
    select
    	    flight_id
    	    , count(bp.seat_no) as booked_seats_count
    from bookings.boarding_passes bp
    		inner join bookings.segments s using(ticket_no, flight_id)
    	group by
    	    flight_id
)

, routes_seats as (
    select
		t.route_no
		, t.flight_id
    		, t.scheduled_departure
		, a.seats_count
		, b.booked_seats_count
		, b.booked_seats_count / a.seats_count::numeric as booked_seats_rate
    from timetable_last_month_only t
        inner join airplanes_seats a using(airplane_code)
        inner join booked_seats b using(flight_id)
)

, flights_avg_seats as (
	select *
		, avg(booked_seats_rate) over (
			partition by route_no
		)
		as avg_booked_seats_rate
	from routes_seats
)

, flights_below_avg as (
	select *
	from flights_avg_seats
	where booked_seats_rate < avg_booked_seats_rate
)

select
	route_no
	, scheduled_departure
	, booked_seats_rate
	, avg_booked_seats_rate
from flights_below_avg
order by route_no, avg_booked_seats_rate desc


/* Найти стоимость последней брони у каждого пассажира */
with
tickets_bookings as (
	select t.*
		, b.book_date
		, b.total_amount 
	from bookings.tickets t
	    left join bookings.bookings b on t.book_ref  = b.book_ref 
)

, ticket_last as (
	select distinct on (passenger_id)
		passenger_id
		, passenger_name
		, book_date as last_book_date
		, total_amount
	from tickets_bookings
	order by passenger_id, book_date desc
)

select
	passenger_id
	, passenger_name
	, last_book_date
	, total_amount
from ticket_last


/* Подсчет международных рейсов между парами аэропортов */
-- GROUP BY
select 
    da.airport_code as departure_airport_code
	, da.airport_name as departure_airport_name
	, da.city as departure_city
	, da.country as departure_country
    , aa.airport_code as arrival_airport_code
	, aa.airport_name as arrival_airport_name
	, aa.city as arrival_city
	, aa.country as arrival_country
	, count(f.flight_id ) as flights_count
from flights f
	inner join routes r on r.route_no = f.route_no AND r.validity @> f.scheduled_departure
	inner join airports da on r.departure_airport = da.airport_code
	inner join airports aa on r.arrival_airport = aa.airport_code
where r.validity @> '2026-01-01'::timestamptz
	and da.country != aa.country
group by
    da.airport_code
	, da.airport_name
	, da.city
	, da.country
    , aa.airport_code
	, aa.airport_name
	, aa.city
	, aa.country

	
-- DISTINCT ON
select distinct on (da.airport_code, aa.airport_code)
    da.airport_code as departure_airport_code
	, da.airport_name as departure_airport_name
	, da.city as departure_city
	, da.country as departure_country
    , aa.airport_code as arrival_airport_code
	, aa.airport_name as arrival_airport_name
	, aa.city as arrival_city
	, aa.country as arrival_country
	, count(f.flight_id) over (partition by da.airport_code, aa.airport_code) as flights_count
from flights f
	inner join routes r on r.route_no = f.route_no AND r.validity @> f.scheduled_departure
	inner join airports da on r.departure_airport = da.airport_code
	inner join airports aa on r.arrival_airport = aa.airport_code
where r.validity @> '2026-01-01'::timestamptz
	and da.country != aa.country
order by
    da.airport_code
    , aa.airport_code


/* Для каждого пассажира в бронировании выяснить:
 * - количество других пассажиров в текущей брони
 * - были ли у данного пассажира другие брони ранее
 * - который раз он бронирует билеты (т.е. сколько бронирований было ранее)
 * - сколько дней прошло с предыдущего бронирования
 * - суммарную стоимость предыдущих бронирований за последние 60 дней
 * - попадает ли пассажир в топ-10 по числу бронирований за всё время
 * */

with
bookings as (
	select b.*
		, t.passenger_id
		, t.passenger_name
		, max(b.book_date) over (
			partition by t.passenger_id
			order by b.book_date
			range between unbounded preceding and interval '1 second' preceding
		) as prev_book_date
		, sum(b.total_amount ) over (
			partition by t.passenger_id
			order by b.book_date
			range between interval '60 day' preceding and interval '1 second' preceding
		) as prev_60_days_amount
	from bookings.bookings b
		inner join bookings.tickets t
			using(book_ref)
)

select * from  bookings
where prev_book_date is not null


/* Построить полную иерархию продуктовых категорий */

with recursive prod_category_hierarchy(id, title, parent_id, parent_title, full_title, level) AS (
    select
		pc.id
		, pc.title
		, pc.parent_id
		, null::varchar(100) as parent_title
		, pc.title::varchar as full_title
        , 0 as level
    from public.prod_categories pc
    where pc.parent_id is null
  union all
    select
		pc.id
		, pc.title
		, pc.parent_id
		, pch.title as parent_title
		, pch.full_title || '|' || pc.title as full_title
		, pch.level + 1 as level
    from prod_category_hierarchy pch
    		inner join public.prod_categories pc
    			on pch.id = pc.parent_id
)

select * 
	, repeat('  ', level) || title as shifted_title
from prod_category_hierarchy
order by full_title;
