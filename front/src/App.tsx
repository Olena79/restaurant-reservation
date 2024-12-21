import React, { useState } from 'react'
import './App.css'

interface Confirmation {
	table: string | null
	time: string | null
}

interface Reservation {
	time: string
	slot_time: string
	reservation_date: string
	table_id: number
	reservation_id: number
	slot_id: number
	status: string
}

const App: React.FC = () => {
	const [selectedDate, setSelectedDate] = useState<Date>(new Date())
	const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
	const [selectedTable, setSelectedTable] = useState<string | null>(null)
	const [isTimeSelectorOpen, setIsTimeSelectorOpen] = useState(false)
	const [confirmation, setConfirmation] = useState<Confirmation | null>(null)
	const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)
	const [reservedTimes, setReservedTimes] = useState<
		{ slot: string; reservation_id: number }[]
	>([])
	const [isLoading, setIsLoading] = useState(false)
	const [isShowingReservedTables, setIsShowingReservedTables] = useState(false)

	const handleDateChange = (date: Date) => {
		setSelectedDate(date)
		setIsDatePickerOpen(false)
	}

	const handleTableClick = async (table: string) => {
		const tableId = table.replace('Table ', '')
		console.log('Processed Table ID:', tableId)

		setSelectedTable(table)
		setIsLoading(true)

		try {
			if (!selectedDate) {
				console.error('Selected date is undefined')
				return
			}
			const reservationDate = selectedDate.toISOString().split('T')[0]
			console.log(
				`http://localhost:5000/api/reservations?table_id=${encodeURIComponent(
					tableId
				)}&reservation_date=${encodeURIComponent(reservationDate)}`
			)

			console.log('Table ID being sent:', tableId)

			const response = await fetch(
				`http://localhost:5000/api/reservations?table_id=${encodeURIComponent(
					tableId
				)}&reservation_date=${encodeURIComponent(reservationDate)}`
			)
			if (!response.ok) {
				const errorText = await response.text()
				console.error(
					`Error: ${response.status} - ${response.statusText}`,
					errorText
				)
				return
			}
			const data: Reservation[] = await response.json()
			console.log('Data: ', data)

			if (Array.isArray(data)) {
				const times = data.map(reservation => {
					const [hours, minutes] = reservation.slot_time.split(':')
					return {
						slot: `${hours}:${minutes}`,
						reservation_id: reservation.reservation_id,
					}
				})
				setReservedTimes(times)
				console.log('Times: ', times)
			} else {
				console.error('Data is not an array:', data)
			}
		} catch (error) {
			console.error('Failed to fetch reservations:', error)
		} finally {
			setIsLoading(false)
			setIsTimeSelectorOpen(true)
		}
	}

	const handleTimeSelect = (time: string) => {
		setConfirmation({ table: selectedTable, time })
		setIsTimeSelectorOpen(false)
		setIsConfirmationOpen(true)
	}

	const closeConfirmation = () => {
		setIsConfirmationOpen(false)
		setConfirmation(null)
	}

	const handleConfirmReservation = async () => {
		if (
			!confirmation ||
			!confirmation.time ||
			!selectedDate ||
			!selectedTable
		) {
			alert('Please select a time, table, and date before confirming.')
			return
		}

		const [hour] = confirmation.time.split(':')
		const slotId = parseInt(hour) - 11 + 1

		try {
			const response = await fetch('http://localhost:5000/api/reservations', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					reservation_date: selectedDate.toISOString().split('T')[0],
					table_id: parseInt(selectedTable.replace('Table ', '')),
					slot_id: slotId,
				}),
			})

			if (response.ok) {
				const successMessage = `Congratulations, your reservation is successful! We are waiting for you on ${
					selectedDate.toISOString().split('T')[0]
				} at ${confirmation.time} (${selectedTable}).`
				alert(successMessage)
			} else {
				const errorMessage = 'Oops!!! Something went wrong, try again.'
				alert(errorMessage)
			}
		} catch (error) {
			console.error('Error while making reservation:', error)
			alert('Oops!!! Something went wrong, try again.')
		} finally {
			closeConfirmation()
		}
	}

	const handleShowReservedTables = () => {
		setIsShowingReservedTables(prevState => !prevState)
	}

	const handleDeleteReservation = async (reservationId: number) => {
		try {
			const response = await fetch('http://localhost:5000/api/reservations', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ reservation_id: reservationId }),
			})

			if (response.ok) {
				alert('Reservation deleted successfully.')
				setReservedTimes(prev =>
					prev.filter(reserved => reserved.reservation_id !== reservationId)
				)
			} else {
				const errorMessage = await response.json()
				alert(errorMessage.message || 'Failed to delete reservation.')
			}
		} catch (error) {
			console.error('Error deleting reservation:', error)
			alert('Something went wrong. Please try again.')
		}
	}

	return (
		<div className='app'>
			<h1 className='restaurant-name'>Restaurant "Delicious food"</h1>

			<button
				className='date-picker-button'
				onClick={() => setIsDatePickerOpen(true)}
			>
				{selectedDate.toISOString().split('T')[0]}
			</button>

			{isDatePickerOpen && (
				<div className='modal'>
					<div className='modal-content'>
						<h2>Select a Date</h2>
						<input
							className='date-input'
							type='date'
							min={new Date().toISOString().split('T')[0]}
							onChange={e => handleDateChange(new Date(e.target.value))}
						/>
						<button
							className='close-button'
							onClick={() => setIsDatePickerOpen(false)}
						>
							Close
						</button>
					</div>
				</div>
			)}

			<div className='table-grid'>
				{Array.from({ length: 10 }, (_, i) => (
					<button
						key={i}
						className='table-button'
						onClick={() => handleTableClick(`Table ${i + 1}`)}
					>
						Table {i + 1}
					</button>
				))}
			</div>

			{isTimeSelectorOpen && (
				<div className='modal-time'>
					<div className='modal-time-content'>
						<h2>Select a Time</h2>
						{isLoading ? (
							<p>Loading...</p>
						) : (
							<div className='time-content'>
								{Array.from({ length: 12 }, (_, i) => {
									const time = `${11 + i}:00`
									const isReserved = reservedTimes.some(
										reserved => reserved.slot === time
									)

									return (
										<button
											key={time}
											className={`time-button ${isReserved ? 'disabled' : ''}`}
											onClick={() => !isReserved && handleTimeSelect(time)}
											disabled={isReserved}
										>
											{time}
										</button>
									)
								})}
							</div>
						)}
						<button
							className='close-button'
							onClick={() => setIsTimeSelectorOpen(false)}
						>
							{' '}
							Close
						</button>
						<button
							className='show-reserved-button'
							onClick={handleShowReservedTables}
						>
							{' '}
							{isShowingReservedTables
								? 'Hide reserved tables'
								: 'Show all reserved tables'}
						</button>
						{isShowingReservedTables && (
							<div className='reserved-tables'>
								{reservedTimes.map((reserved, index) => (
									<p className='reserved-item' key={index}>
										<span className='reserved-item-tt'>{selectedTable}</span>
										<span className='reserved-item-text'>is reserved at</span>
										<span className='reserved-item-tt'>{reserved.slot}</span>
										<button
											className='delete-button'
											onClick={() =>
												handleDeleteReservation(reserved.reservation_id)
											}
										>
											{' '}
											Delete reservation
										</button>
									</p>
								))}
							</div>
						)}
					</div>
				</div>
			)}

			{isConfirmationOpen && confirmation && (
				<div className='modal-confirm'>
					<div className='modal-confirm-content'>
						<p className='confirm-info'>
							<span>Are you sure you want to reserve</span>
							<span>
								{confirmation.table} at {confirmation.time}?
							</span>
						</p>
						<button
							className='confirm-button'
							onClick={handleConfirmReservation}
						>
							Confirm
						</button>
						<button className='close-button' onClick={closeConfirmation}>
							Cancel
						</button>
					</div>
				</div>
			)}
		</div>
	)
}

export default App
